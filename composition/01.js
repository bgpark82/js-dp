const Button = class {
  show() {
    alert("!");
  }
  render() {
    const test = document.querySelector("#data");
    const button = document.createElement("button");
    button.innerHTML = "버튼";
    button.addEventListener("click", () => {
      this.show();
    });
    test.appendChild(button);
    console.log(test);
  }
};

const b = new Button();
b.render();
