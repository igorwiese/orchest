import type { IOrchestSession, IOrchestSessionUuid } from "@/types";
import { fetcher } from "@/utils/fetcher";
import pascalCase from "pascalcase";
import React from "react";
import useSWR from "swr";
import { useOrchest } from "./context";
import { isSession } from "./utils";

type TSessionStatus = IOrchestSession["status"];

const ENDPOINT = "/catch/api-proxy/api/sessions/";

const lowerCaseFirstLetter = (str: string) =>
  str.charAt(0).toLowerCase() + str.slice(1);

const convertKeyToCamelCase = <T extends unknown>(data: T, keys?: string[]) => {
  if (!data) return data;
  if (keys) {
    for (const key of keys) {
      data[lowerCaseFirstLetter(pascalCase(key))] = data[key];
    }
    return data as T;
  }
  return Object.entries(data).reduce((newData, curr) => {
    const [key, value] = curr;
    return {
      ...newData,
      [lowerCaseFirstLetter(pascalCase(key))]: value,
    };
  }, {}) as T;
};

/* Matchers
  =========================================== */

const isStoppable = (status: TSessionStatus) =>
  ["RUNNING", "LAUNCHING"].includes(status);

const isWorking = (status: TSessionStatus) =>
  ["LAUNCHING", "STOPPING"].includes(status);

/* Fetchers
  =========================================== */

const stopSession = ({ pipelineUuid, projectUuid }: IOrchestSessionUuid) =>
  fetcher([ENDPOINT, projectUuid, "/", pipelineUuid].join(""), {
    method: "DELETE",
  });

export const useOrchestSessions = () => {
  const { state, dispatch } = useOrchest();

  /**
   * Use SWR to fetch and cache the data from our sessions endpoint
   *
   * Note: the endpoint does **not** return `STOPPED` sessions. This is handled
   * in a later side-effect.
   */
  const { data, mutate, error } = useSWR<{
    sessions: (IOrchestSession & {
      project_uuid: string;
      pipeline_uuid: string;
    })[];
    status: TSessionStatus;
  }>(ENDPOINT, fetcher, {
    refreshInterval: 1000,
  });

  const isLoading = !data && !error;
  const isLoaded = !isLoading;

  if (error) {
    console.error("Unable to fetch sessions", error);
  }

  /**
   * SYNC
   *
   * Push SWR changes to Orchest Context when at least one session exists
   * NOTE: we need to convert project_uuid and pipeline_uuid to camelcase because they were used everywhere
   */
  React.useEffect(() => {
    const sessions =
      data?.sessions.map((session) =>
        convertKeyToCamelCase(session, ["project_uuid", "pipeline_uuid"])
      ) || [];

    dispatch({
      type: "_sessionsSet",
      payload: {
        sessions: sessions as IOrchestSession[],
        sessionsIsLoading: isLoading,
      },
    });
  }, [data, isLoading]);

  /**
   * TOGGLE
   */
  React.useEffect(() => {
    const foundSession =
      isLoaded &&
      data?.sessions?.find((dataSession) =>
        isSession(dataSession, state?._sessionUuid)
      );

    // no cashed session from useSWR, nor previous session in the memory
    if (!foundSession && !state._sessionUuid) {
      dispatch({ type: "_sessionUuidClear" });
      return;
    }

    /* use the cashed session from useSWR or create a temporary one out of previous one */
    const session = convertKeyToCamelCase<IOrchestSession>(foundSession, [
      "project_uuid",
      "pipeline_uuid",
    ]) || { ...state._sessionUuid, status: null };

    /**
     * Any session-specific cache mutations must be made with this helper to
     * ensure we're only mutating the requested session
     */
    const mutateSession = (
      newSessionData?: Partial<IOrchestSession>,
      shouldRevalidate?: boolean
    ) =>
      mutate(
        (cachedData) =>
          newSessionData && {
            ...cachedData,
            sessions: cachedData?.sessions.map((sessionData) =>
              sessionData && isSession(session, sessionData)
                ? { ...sessionData, ...newSessionData }
                : sessionData
            ),
          },
        shouldRevalidate
      );

    /**
     * LAUNCH
     */
    if (!session.status) {
      mutateSession({ status: "LAUNCHING" }, false);

      fetcher(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
          pipeline_uuid: session.pipelineUuid,
          project_uuid: session.projectUuid,
        }),
      })
        .then((sessionDetails) => mutateSession(sessionDetails))
        .catch((err) => {
          if (err?.message) {
            dispatch({
              type: "alert",
              payload: ["Error while starting the session", err.message],
            });
          }

          console.error(err);
        });

      dispatch({ type: "_sessionUuidClear" });
      return;
    }

    /**
     * WORKING
     * Note: Our UI should prevent users from ever seeing this error – e.g. by
     * disabling buttons – but it's here just in case.
     */
    if (isWorking(session.status)) {
      dispatch({
        type: "alert",
        payload: [
          "Error",
          "Please wait, the pipeline session is still " +
            { STARTING: "launching", STOPPING: "shutting down" }[
              session.status
            ] +
            ".",
        ],
      });
      dispatch({ type: "_sessionUuidClear" });
      return;
    }

    /**
     * DELETE
     */
    if (isStoppable(session.status)) {
      mutateSession({ status: "STOPPING" }, false);

      stopSession(session)
        .then(() => mutate())
        .catch((err) => {
          console.error(err);
        });
      dispatch({ type: "_sessionUuidClear" });
      return;
    }

    dispatch({ type: "_sessionUuidClear" });
  }, [state._sessionUuid]);

  /**
   * DELETE ALL
   */
  React.useEffect(() => {
    if (state.sessionsKillAllInProgress !== true || !data) return;

    // Mutate `isStoppable` sessions to "STOPPING"
    mutate(
      (cachedData) => ({
        ...cachedData,
        sessions: cachedData?.sessions.map((sessionValue) => ({
          ...sessionValue,
          status: isStoppable(sessionValue.status)
            ? "STOPPING"
            : sessionValue.status,
        })),
      }),
      false
    );

    // Send delete requests for `isStoppable` sessions
    Promise.all(
      data?.sessions
        .filter((sessionData) => isStoppable(sessionData.status))
        .map((sessionData) => {
          stopSession({
            projectUuid: sessionData.project_uuid,
            pipelineUuid: sessionData.pipeline_uuid,
          });
        })
    )
      .then(() => {
        mutate();
        dispatch({
          type: "_sessionsKillAllClear",
        });
      })
      .catch((err) => {
        console.error("Unable to stop all sessions", err);
        dispatch({
          type: "_sessionsKillAllClear",
        });
      });
  }, [state.sessionsKillAllInProgress]);
};
