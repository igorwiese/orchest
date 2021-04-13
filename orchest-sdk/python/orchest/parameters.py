"""Module to interact with the parameter values of pipeline steps.

Parameters are stored in the corresponding pipeline definition file,
e.g. ``pipeline.orchest``.

"""
import json
from typing import Any, Optional, Tuple

from orchest.config import Config
from orchest.error import StepUUIDResolveError
from orchest.pipeline import Pipeline, PipelineStep
from orchest.utils import get_step_uuid


def __get_pipeline() -> Pipeline:
    with open(Config.PIPELINE_DEFINITION_PATH, "r") as f:
        pipeline_definition = json.load(f)
    return Pipeline.from_json(pipeline_definition)


def __get_current_step(pipeline: Pipeline) -> PipelineStep:
    try:
        step_uuid = get_step_uuid(pipeline)
    except StepUUIDResolveError:
        raise StepUUIDResolveError("Parameters could not be identified.")
    return pipeline.get_step_by_uuid(step_uuid)


def get_params() -> Tuple[dict, dict]:
    """Gets the parameters of the current step and the pipeline.

    Returns:
        A tuple of two elements, where the first is the parameters of
        the current step, the second is the parameters of the pipeline.
    """
    pipeline = __get_pipeline()
    step = __get_current_step(pipeline)
    return step.get_params(), pipeline.get_params()


def update_params(
    step_params: Optional[dict] = None, pipeline_params: Optional[dict] = None
) -> None:
    """Updates the parameters of the current step and of the pipeline.

    Additionally, you can set new parameters by giving parameters that
    do not yet exist in the current parameters, either of the step or of
    the pipeline.

    Internally the updating is done by calling the ``dict.update``
    method. This further explains the behavior of this method.

    Args:
        step_params: The step parameters to update. Either updating
            their values or adding new parameter keys.
        pipeline_params: The pipeline parameters to update. Either
            updating their values or adding new parameter keys.

    Warning:
        Updating the `pipeline_params` can lead to race conditions,
        since different steps could be updating them at the same time.

    """
    pipeline = __get_pipeline()

    if pipeline_params is not None:
        pipeline.update_params(pipeline_params)

    if step_params is not None:
        step = __get_current_step(pipeline)
        step.update_params(step_params)

    with open(Config.PIPELINE_DEFINITION_PATH, "w") as f:
        json.dump(pipeline.to_dict(), f, indent=4, sort_keys=True)


def get_step_param(key: str) -> Any:
    """Gets a parameter of the current step by name.

    Args:
        key: The step parameter to get.

    Returns:
        The value that was mapped to the step parameter name.
    """
    pipeline = __get_pipeline()
    step = __get_current_step(pipeline)
    params = step.get_params()
    return params[key]


def get_pipeline_param(key: str) -> Any:
    """Gets a pipeline parameter by name.

    Args:
        key: The pipeline parameter to get.

    Returns:
        The value that was mapped to the pipeline parameter name.
    """
    pipeline = __get_pipeline()
    params = pipeline.get_params()
    return params[key]


def update_step_param(key: str, value: Any) -> None:
    """Updates or sets a step parameter.

    Internally the updating is done by calling the ``dict.update``
    method. This further explains the behavior of this method.

    Args:
        key: The step parameter to update/set.
        value: The value that will be set.
    """
    pipeline = __get_pipeline()
    step = __get_current_step(pipeline)
    step.update_params({key: value})
    with open(Config.PIPELINE_DEFINITION_PATH, "w") as f:
        json.dump(pipeline.to_dict(), f, indent=4, sort_keys=True)


def update_pipeline_param(key: str, value: Any) -> None:
    """Updates or sets a pipeline parameter.

    Internally the updating is done by calling the ``dict.update``
    method. This further explains the behavior of this method.

    Args:
        key: The pipeline parameter to update/set.
        value: The value that will be set.

    Warning:
        Updating a pipeline parameter can lead to race conditions,
        since different steps could be updating pipeline parameters at
        the same time.
    """
    pipeline = __get_pipeline()
    pipeline.update_params({key: value})
    with open(Config.PIPELINE_DEFINITION_PATH, "w") as f:
        json.dump(pipeline.to_dict(), f, indent=4, sort_keys=True)
