const Github = class {
  constructor(id, repo) {
    this._base = `https://api.github.com/repos/${id}/${repo}/contents/`;
  }
  load(path) {
    const id = "callback" + Github._id++;
    const f = (Github[id] = ({ data: { content } }) => {
      delete Github[id];
      document.head.removeChild(s);
      this._loaded(content);
    });

    const s = document.createElement("script");
    s.src = `${this._base + path}?callback=Github.${id}`;
    document.head.appendChild(s);
  }
  _loaded(v) {
    throw "override!";
  }
};
Github.id = 0; // 굳이 전역일 필요는 없다.

const ImageLoader = class extends Github {
  constructor(id, repo, target) {
    super(id, repo);
    this._target = target;
  }
  _loaded(v) {
    this._target.src = `data:text/plain;base64,${v}`;
    console.log(this._target);
  }
};

const s75img = new ImageLoader(
  "pop8682",
  "js-dp",
  document.querySelector("#img")
);
s75img.load("puppy.jpeg");
