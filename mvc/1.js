const View = class {
    constructor(controller, isSingleton = false, _=type(controller, Home)){
        this._controller = controller;
        if(isSingleton) singleton.getInstance(this)
    }
    render(model = null){override()}
}

const HomeBaseView = class extends View {
    constructor(controller, isSingleton){
        super(controller, isSingleton)
    }
    render(model, _=type(model,HomeModel)){
        const {_controller:ctrl} = this
        return append(el('section'),
            el('h2','innerHTML',model.title),
            el('p','innerHTML',model.memo),
            el('button','innerHTML','delete','addEventListener',['click',_=ctrl.$removeDetail(model.id)])
        )
    }
}

const HomeDetailView = class extends View {}

const Singleton = class extends WeakMap{
    get(){err()}
    has(){err()}
    set(){err()}
    getInstance(v){
        if(!super.has(v.constructor)) super.set(v.constructor, v);
        return super.get(v.constructor);
    }
}

const singleton = new Singleton();

const Model = class extends Set {
    constructor(isSingleton){
        super();
        if(isSingleton) singleton.getInstance(this);
    }
    add(){err()};
    delete(){err();}
    has(){err()}
}

const HomeModel = class extends Model {
    constructor(isSingleton){
        super(isSingleton)
        if(!this._list){
            this._list = [
                new HomeDetailModel(1, 'todo1','memo1'),
                new HomeDetailModel(2, 'todo2','memo2'),
                new HomeDetailModel(3, 'todo3','memo3'),
                new HomeDetailModel(4, 'todo4','memo4'),
                new HomeDetailModel(5, 'todo5','memo5'),
                new HomeDetailModel(6, 'todo6','memo6')
            ]
        }
    }
    get list() {return this._list}
    add(...model){
        this._list.push(...model)
    }
    remove(id){
        const {_list:list} = this;
        if(!list.some((model,i)=>{
            if(model.id == id){
                list.splice(i,1)
                return true;
            }
        })) err();
        this.notify();
    }
}

const HomeDetailModel = class extends Model {
    constructor(id, title, memo = ''){
        super()
        this._id = id;
        this._title = title;
        this._memo = memo;
    }
    get id(){return this._id}
    get title(){return this._title}
    get memo(){return this._memo}
}

const Controller = class {
    constructor(isSingleton){
        if(isSingleton) return singleton.getInstance(this);
    }
}

const Home = class extends Controller {
    constructor(isSingleton){
        super(isSingleton)
    }
    base(){
        const view = new HomeBaseView(this,true);
        const model = new HomeModel(true);
        return view.render(model);
    }
    detail(id){
        const view = new HomeDetailView(this, true);
        const model = new HomeModel(true);
        return view.render(model.get(id));
    }
    $removeDetail(id){
        this.$remove(id);
        this.$list();
    }
    $remove(id){
        const model = new HomeModel(true);
        model.remove(id);
        this.$list()
    }
    $list(){
        app.route('home');
    }
    $detail(id){
        app.route('home:detail',id);
    }
}

const App = class {
    constructor(parent){
        this._parent = parent;
        this._map = new Map;
    }
    add(path,controller){
        path = path.split(":");
        this._map.set(path[0],controller);
        (path[0] || '').split(",").concat("base").forEach(sub =>{
            this._map.set(`${path[0]}:${sub}`, controller);
        }) 
    }
    route(paths, ...arg){
        const [path, action = "base"] = paths.split(":");
        if(!this._map.has(path)) return;
        const controller = this._map.get(path)();
        append(el(sel(this._parent), "innerHTML",""),controller[action](...arg));
    }
}

const app = new App("#stage");
app.add("home:detail",_=>new Home(true));
app.route("home");