// @ts-nocheck
import { MDCButtonReact, MDCTextFieldReact } from "@orchest/lib-mdc";
import { makeRequest } from "@orchest/lib-utils";
import * as React from "react";

export default class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loginFailure: undefined,
      username: "",
      password: "",
    };
  }

  submitLogin(e) {
    e.preventDefault();

    let formData = new FormData();
    formData.append("username", this.state.username);
    formData.append("password", this.state.password);

    let queryString = this.props.queryArgs ? "?" + this.props.queryArgs : "";
    makeRequest("POST", "/login/submit" + queryString, {
      type: "FormData",
      content: formData,
    })
      .then((response) => {
        let result = JSON.parse(response);
        if (result.redirect) {
          window.location.href = result.redirect;
        }
      })
      .catch((response) => {
        let result = JSON.parse(response.body);
        this.setState({
          loginFailure: result.error,
        });
      });
  }

  handleInput(key, value) {
    let data = {};
    data[key] = value;
    this.setState(data);
  }

  render() {
    return (
      <div className="login-holder">
        {this.props.cloud && (
          <div className="cloud-login-helper">
            <div className="text-holder">
              <img src="image/logo.png" width="300px" />
              <h1>You have been added to a private Dtw Analytics instance</h1>
              <p>
                You can login with the username and password provided by the
                instance owner.
              </p>
              <p>
                To access the Dtw Analytics dashboard please{" "}
                <a href={this.props.cloudURL}>login here</a>.
              </p>
            </div>
          </div>
        )}
        <div className="main-login-view">
          <div className="login-form">
            <div className="box">
              {this.props.cloud ? (
                <h2>
                  Login to your
                  <br />
                  Dtw Analytics Instance
                </h2>
              ) : (
                <img src="image/logo.png" width="300px" className="logo" />
              )}
              <form method="post" onSubmit={this.submitLogin.bind(this)}>
                <MDCTextFieldReact
                  label="Username"
                  value={this.state.username}
                  onChange={this.handleInput.bind(this, "username")}
                  name="username"
                />
                <br />
                <MDCTextFieldReact
                  label="Password"
                  value={this.state.password}
                  onChange={this.handleInput.bind(this, "password")}
                  inputType="password"
                  name="password"
                />
                <br />
                <MDCButtonReact
                  submitButton
                  classNames={["mdc-button--raised", "themed-secondary"]}
                  label="Login"
                />
                {(() => {
                  if (this.state.loginFailure) {
                    return (
                      <div className="error push-up">
                        {this.state.loginFailure}
                      </div>
                    );
                  }
                })()}
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
