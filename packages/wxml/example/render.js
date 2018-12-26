const createElement = (type, props, children) => {
  return { type, props, children };
};

function render() {
  return [
    createElement("import", {
      "src": "./item.wxml"
    }, null),
    createElement("template", {
      "is": "item",
      "data": "{{text: 'forbar'}}"
    }, null),
    createElement("view", {
      "class": "login"
    }, [createElement("text", {
        "class": "h1 title center"
      }, ["login"]),
      createElement("form", {
        "bindsubmit": "onLogin"
      }, [createElement("input", {
          "name": "username",
          "type": "text",
          "placeholder": "username"
        }, null),
        createElement("input", {
          "name": "password",
          "type": "password",
          "placeholder": "password"
        }, null),
        createElement("button", {
          "type": "primary",
          "formType": "submit"
        }, ["login"])
      ]),
      createElement("navigator", {
        "class": "join"
      }, ["join us?"])
    ])
  ];
}

console.log(render());