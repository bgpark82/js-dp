const Data = class {
  async getData() {
    const json = await this._getData();
    return json;
  }

  _getData() {
    throw "override!";
  }
};

const JsonData = class extends Data {
  constructor(data) {
    super();
    this._data = data;
  }

  async _getData() {
    let json;
    if (typeof this._data == "string") {
      const req = await fetch(this._data);
      return await req.json();
    } else return this._data;
  }
};

const Renderer = class {
  async render(data) {
    this._info = await data.getData();
    this._render();
  }

  _render() {
    throw "override";
  }
};

const TableRenderer = class {
  constructor(root) {
    super();
    this._root = root;
  }

  _render() {
    const root = document.querySelector(this._root);
    root.innerHTML = "";
    const [table, caption] = "table,caption"
      .split(",")
      .map(v => document.createElement(v));
  }
};

const data = new JsonData("api.json");
const renderer = new TableRenderer("#data");
renderer.render(data);
