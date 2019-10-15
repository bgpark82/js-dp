const Github = class {
  constructor(id, repo) {
    this._base = `https://api.github.com/repos/${id}/${repo}/contents/`;
  }

  setParser(fnc, ...arg) {
    this._parser = [fnc, arg];
  }

  load(v) {
    this._parser[0](content, ...this._parser[1]);
  }
};

const Loader = class {
  constructor(id, repo) {
    this._git = new Github(id, repo);
    this._router = new Map();
  }

  setRouter(ext, func, ...arg) {
    ext.split(",").forEach(v => this._router.set(v, [func, ...arg]));
  }

  load(v) {
    const ext = v.split(".").pop();
    this._git.setParser(...this._router.get(ext));
    this._git.load(v);
  }
};

const loader = new Loader("pop8682", "js-dp");

const el = v => {
  document.querySelector(v);
};
const img = (v, el) => (el.src = `data:text/plain;base64,${v}`);
loader.setRouter("jpg,png,jpeg", img, el("#img"));
loader.load("puppy.jpeg");
