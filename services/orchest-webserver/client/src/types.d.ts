import React from "react";

export interface IOrchestConfig {
  CLOUD: boolean;
  CLOUD_UNMODIFIABLE_CONFIG_VALUES?: string[] | null;
  ENVIRONMENT_DEFAULTS: {
    base_image: string;
    gpu_support: boolean;
    language: string;
    name: string;
    setup_script: string;
  };
  FLASK_ENV: string;
  GPU_ENABLED_INSTANCE: boolean;
  GPU_REQUEST_URL: string;
  INTERCOM_APP_ID: string;
  INTERCOM_DEFAULT_SIGNUP_DATE: string;
  ORCHEST_SOCKETIO_ENV_BUILDING_NAMESPACE: string;
  ORCHEST_SOCKETIO_JUPYTER_BUILDING_NAMESPACE: string;
  ORCHEST_WEB_URLS: {
    github: string;
    readthedocs: string;
    slack: string;
    website: string;
    orchest_examples_repo: string;
    orchest_examples_json: string;
  };
  PIPELINE_PARAMETERS_RESERVED_KEY: string;
  TELEMETRY_DISABLED: boolean;
}

export interface IOrchestUserConfig {
  AUTH_ENABLED?: boolean;
  TELEMETRY_UUID: string;
  INTERCOM_USER_EMAIL: string;
}

export interface IOrchestSessionUuid {
  projectUuid: string;
  pipelineUuid: string;
}

export interface IOrchestSession extends IOrchestSessionUuid {
  status?: "RUNNING" | "LAUNCHING" | "STOPPING";
  jupyter_server_ip?: string;
  notebook_server_info?: {
    port: number;
    base_url: string;
  };
  user_services?: {
    [key: string]: {
      name: string;
      image: string;
    };
  };
}

export interface IOrchestState
  extends Pick<
    Omit<IOrchestSession, "pipeline_uuid" | "project_uuid">,
    "projectUuid" | "pipelineUuid"
  > {
  alert?: string[];
  isLoading: boolean;
  drawerIsOpen: boolean;
  pipelineName?: string;
  pipelineFetchHash?: string;
  pipelineIsReadOnly: boolean;
  pipelineSaveStatus: "saved" | "saving";
  projects: Project[];
  hasLoadedProjects: boolean;
  sessions?: IOrchestSession[] | [];
  sessionsIsLoading?: boolean;
  sessionsKillAllInProgress?: boolean;
  config: IOrchestConfig;
  user_config: IOrchestUserConfig;
  unsavedChanges: boolean;
  _sessionsToFetch?: IOrchestSessionUuid[] | [];
  _sessionsToggle?: IOrchestSessionUuid;
  _sessionsIsPolling?: boolean;
}

export type TOrchestAction =
  | { type: "alert"; payload: IOrchestState["alert"] }
  | { type: "isLoaded" }
  | { type: "pipelineClear" }
  | {
      type: "pipelineSet";
      payload: Partial<
        Pick<IOrchestState, "pipelineUuid" | "projectUuid" | "pipelineName">
      >;
    }
  | {
      type: "pipelineSetSaveStatus";
      payload: IOrchestState["pipelineSaveStatus"];
    }
  | {
      type: "projectSet";
      payload: IOrchestState["projectUuid"];
    }
  | {
      type: "projectsSet";
      payload: Project[];
    }
  | {
      type: "pipelineUpdateReadOnlyState";
      payload: IOrchestState["pipelineIsReadOnly"];
    }
  | { type: "drawerToggle" }
  | {
      type: "sessionToggle";
      payload: IOrchestSessionUuid;
    }
  | { type: "setUnsavedChanges"; payload: IOrchestState["unsavedChanges"] }
  | { type: "_sessionsToggleClear" }
  | {
      type: "_sessionsSet";
      payload: Pick<IOrchestState, "sessions" | "sessionsIsLoading">;
    }
  | { type: "sessionsKillAll" }
  | { type: "_sessionsKillAllClear" }
  | { type: "_sessionsPollingStart" }
  | { type: "_sessionsPollingClear" };

export interface IOrchestGet {
  currentSession: IOrchestSession;
  session: (
    session: Pick<IOrchestSession, "pipelineUuid" | "projectUuid">
  ) => IOrchestSession;
}

export interface IOrchestContext {
  state: IOrchestState;
  dispatch: React.Dispatch<TOrchestAction>;
  get: IOrchestGet;
}

export interface IQueryArgs
  extends Partial<
    Record<
      | "environment_uuid"
      | "import_url"
      | "initial_tab"
      | "job_uuid"
      | "pipeline_uuid"
      | "project_uuid"
      | "run_uuid"
      | "step_uuid",
      string
    >
  > {
  read_only?: "true" | "false";
}

export type TViewPropsWithRequiredQueryArgs<K extends keyof IQueryArgs> = {
  queryArgs?: Omit<IQueryArgs, K> & Required<Pick<IQueryArgs, K>>;
};

export type Project = {
  path: string;
  uuid: string;
  pipeline_count: number;
  session_count: number;
  job_count: number;
  environment_count: number;
};

export type Environment = {
  base_image: string;
  gpu_support: boolean;
  language: string;
  name: string;
  project_uuid: string;
  setup_script: string;
  uuid: string;
};

export type EnvironmentBuild = {
  environment_uuid: string;
  finished_time: string;
  project_path: string;
  project_uuid: string;
  requested_time: string;
  started_time: string;
  status: "PENDING" | "STARTED" | "SUCCESS" | "FAILURE" | "ABORTED";
  uuid: string;
};

export type Job = {
  created_time: string;
  env_variables: Record<string, string>;
  last_scheduled_time: string;
  name: string;
  next_scheduled_time: string;
  parameters: Record<string, unknown>[];
  pipeline_definition: {
    name: string;
    parameters: Record<string, unknown>;
    settings: {
      auto_eviction: boolean;
      data_passing_memory_size: string;
    };
    uuid: string;
    steps: Record<string, Step>;
    version: string;
  };
  pipeline_name: string;
  pipeline_run_spec: {
    run_config: {
      host_user_dir: string;
      pipeline_path: string;
      project_dir: string;
    };
    scheduled_start: null;
    uuids: string[];
    project_uuid: string | null;
    run_type: string;
  };
  pipeline_runs: any[];
  pipeline_uuid: string;
  project_uuid: string;
  schedule: string;
  status: "STARTED" | "PAUSED" | "PENDING" | "ABORTED" | "DRAFT";
  strategy_json: Record<string, unknown>;
  total_scheduled_executions: number;
  uuid: string;
};

export type Step = Record<
  string,
  {
    environment: string;
    file_path: string;
    incoming_connections: string[];
    kernel: { display_name: string; name: string };
    meta_data: { hidden: boolean; position: [number, number] };
    parameters: Record<string, any>;
    title: string;
    uuid: string;
  }
>;

export type PipelineJson = {
  name: string;
  parameters: Record<string, any>;
  settings: {
    auto_eviction?: boolean;
    data_passing_memory_size?: string;
  };
  steps: Step;
  uuid: string;
  version: string;
  services?: Record<string, any>;
};

export type Example = {
  description: string; // 280 characters
  forks_count: number;
  owner: "orchest" | string;
  stargazers_count: number;
  tags: string[];
  title: string;
  url: string;
};
