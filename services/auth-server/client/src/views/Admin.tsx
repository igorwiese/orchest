// @ts-nocheck
import { MDCButtonReact, MDCTextFieldReact } from "@orchest/lib-mdc";
import { makeRequest } from "@orchest/lib-utils";
import * as React from "react";

export default class Admin extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
      newUsername: "",
      newPassword: "",
      formError: undefined,
    };
  }

  componentDidMount() {
    this.fetchUsers();
  }

  fetchUsers() {
    makeRequest("GET", "/login/users")
      .then((response) => {
        this.setState({
          users: JSON.parse(response)["users"],
        });
      })
      .catch((response) => {
        console.log(response);
      });
  }

  handleInput(key, value) {
    let data = {};
    data[key] = value;
    this.setState(data);
  }

  addUser() {
    // auto save the bash script
    let formData = new FormData();
    formData.append("username", this.state.newUsername);
    formData.append("password", this.state.newPassword);

    this.setState({
      newUsername: "",
      newPassword: "",
      formError: "",
    });

    makeRequest("POST", "/login/users", {
      type: "FormData",
      content: formData,
    })
      .then(() => {
        this.fetchUsers();
      })
      .catch((response) => {
        let result = JSON.parse(response.body);
        this.setState({
          formError: result.error,
        });
      });
  }

  deleteUser(username) {
    // auto save the bash script
    let formData = new FormData();
    formData.append("username", username);

    this.setState({
      formError: "",
    });

    makeRequest("DELETE", "/login/users", {
      type: "FormData",
      content: formData,
    })
      .then(() => {
        this.fetchUsers();
      })
      .catch((response) => {
        let result = JSON.parse(response.body);
        this.setState({
          formError: result.error,
        });
      });
  }

  render() {
    let userNodes = [];
    for (let user of this.state.users) {
      userNodes.push(
        <div key={user.username} className="delete-user-form">
          <span>{user.username}</span>
          <MDCButtonReact
            onClick={this.deleteUser.bind(this, user.username)}
            label="Delete"
            data-test-id={`delete-user-${user.username}`}
          />
        </div>
      );
    }

    return (
      <div className="edit-users-form">
        <div className="group">
          <h2>Add a user</h2>
          <MDCTextFieldReact
            value={this.state.newUsername}
            onChange={this.handleInput.bind(this, "newUsername")}
            label="Username"
            name="username"
            data-test-id="new-user-name"
          />
          <br />
          <MDCTextFieldReact
            value={this.state.newPassword}
            onChange={this.handleInput.bind(this, "newPassword")}
            label="Password"
            inputType="password"
            name="password"
            data-test-id="new-user-password"
          />
          <br />
          <MDCButtonReact
            onClick={this.addUser.bind(this)}
            classNames={["mdc-button--raised"]}
            label="Add"
            data-test-id="add-user"
          />

          {this.state.formError && (
            <p className="push-up error">{this.state.formError}</p>
          )}
        </div>
        <div className="group">
          <h2>Delete users</h2>
          {userNodes.length != 0 ? userNodes : <i>There are no users yet.</i>}
        </div>
      </div>
    );
  }
}
