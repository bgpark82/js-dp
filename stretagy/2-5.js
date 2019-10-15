const Github = class {
  constructor(id, repo) {
    this._base = `https://api.github.com/repos/${id}/${repo}/contents/`;
  }
  load(path) {
    if (!this._parser) return;
    console.log(this._parser);
    const id = "callback" + Github._id++;
    const f = (Github[id] = ({ data: { content } }) => {
      delete Github[id];
      document.head.removeChild(s);
      // this._parser(content);
      this._parser[0](content, ...this._parser[1]);
    });

    const s = document.createElement("script");
    s.src = `${this._base + path}?callback=Github.${id}`;
    document.head.appendChild(s);
  }
  // set parser(v) {this._parser = v;}
  setParser(f, ...arg) {
    this._parser = [f, arg];
  }
};
Github.id = 0; // 굳이 전역일 필요는 없다.

const Loader = class {
  constructor(id, repo) {
    this._git = new Github(id, repo); // github
    this._router = new Map();
    console.log(this._git);
    console.log(this._router);
  }
  add(ext, tag, ...arg) {
    ext.split(",").forEach(v => this._router.set(v, [tag, ...arg])); // _router에 tag 배열 넣기
  }
  load(v) {
    const ext = v.split(".").pop();
    if (!this._router.has(ext)) return;
    console.log(...this._router.get(ext));

    this._git.setParser(...this._router.get(ext));
    this._git.load(v);
  }
};

const loader = new Loader("pop8682", "js-dp");

const el = v => document.querySelector(v);
const img = (v, el) => (el.src = `data:text/plain;base64,${v}`);
loader.add("jpg,png,gif,jpeg", img, el("#img"));

loader.load("puppy.jpeg");
