import { MDCTextFieldReact } from "@orchest/lib-mdc";
import { parseISO } from "date-fns";
import * as React from "react";

export type TDateTimeInputRef = any;
export interface IDateTimeInputProps {
  disabled?: boolean;
  onFocus?: any;
}

const DateTimeInput = React.forwardRef<TDateTimeInputRef, IDateTimeInputProps>(
  ({ disabled, onFocus, ...props }, ref) => {
    let date = new Date();
    const [state, setState] = React.useState({
      timeValue:
        ("0" + date.getHours()).slice(-2) +
        ":" +
        ("0" + date.getMinutes()).slice(-2),
      dateValue:
        date.getFullYear() +
        "-" +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + date.getDate()).slice(-2),
    });

    const getISOString = () =>
      parseISO(state.dateValue + " " + state.timeValue).toISOString();

    React.useImperativeHandle(ref, () => ({
      getISOString,
    }));

    return (
      <div className="datetime-input">
        <div>
          <MDCTextFieldReact
            label="Time"
            inputType="time"
            disabled={disabled}
            value={state.timeValue}
            onChange={(value) => {
              setState((prevState) => ({ ...prevState, timeValue: value }));
            }}
            onFocus={onFocus}
            data-test-id={props["data-test-id"] + "-time"}
          />
        </div>
        <div>
          <MDCTextFieldReact
            label="Date"
            inputType="date"
            disabled={disabled}
            value={state.dateValue}
            onChange={(value) => {
              setState((prevState) => ({ ...prevState, dateValue: value }));
            }}
            onFocus={onFocus}
            data-test-id={props["data-test-id"] + "-date"}
          />
        </div>
      </div>
    );
  }
);

export default DateTimeInput;
