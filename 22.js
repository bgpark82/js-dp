const Data = class {
  async getData() {
    const json = await this._getData();

    return json;
  }
  async _getData() {
    throw "it has to be overridden";
  }
};

const JsonData = class extends Data {
  constructor(url) {
    super();
    this._url = url;
  }
  async _getData() {
    const req = await fetch(this._url);
    const res = await req.json();
    return res;
  }
};

const Renderer = class {
  async render(data) {
    this.json = await data.getData();
    this._render();
  }

  _render() {
    throw "it has to be overridden";
  }
};

const TableRenderer = class extends Renderer {
  constructor(parent) {
    super(); // Renderer.call(this) : 부모의 this를 바로 들고 옴
    this._parent = parent;
  }

  _render() {
    const parent = document.querySelector(this._parent);
    if (!parent) throw "invalid parent";
    parent.innerHTML = "";
    const [table, caption] = "table,caption"
      .split(",")
      .map(v => document.createElement(v));
    caption.innerHTML = this.json.title;
    table.appendChild(caption);
    table.appendChild(
      this.json.header.reduce(
        (thead, data) => (
          (thead.appendChild(document.createElement("th")).innerHTML = data),
          thead
        ),
        document.createElement("thead")
      )
    );
    parent.appendChild(
      this.json.items.reduce(
        (table, row) => (
          table.appendChild(
            row.reduce(
              (tr, data) => (
                (tr.appendChild(document.createElement("td")).innerHTML = data),
                tr
              ),
              document.createElement("tr")
            )
          ),
          table
        ),
        table
      )
    );
  }
};

const data = new JsonData("api.json"); // api -> json      어떤 자료를 받아올 것인가. (파라미터 한개)
const renderer = new TableRenderer("#data"); // div              어디에 렌더링 할 것인가. (파라미터 한개)
console.dir(renderer);
renderer.render(data); // json -> div
