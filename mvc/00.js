const Singleton = class extends WeakMap{
    has(){err()};
    get(){err()};
    set(){err()};
    getInstance(v){
        if(!super.has(v.constructor)) super.set(v.constructor, v);
        return super.get(v.constructor);
    }    
}

const singleton = new Singleton;

const Model = class extends Set{
    constructor(isSingleton){
        super();
        if(isSingleton) return singleton.getInstance(this);
    }

    add() {err();};
    delete() {err();};
    has(){err()};

    addController(ctrl, _=type(ctrl,Controller)){
        super.add(ctrl);
    }
    removeController(ctrl, _=type(ctrl,Controller)){
        super.delete(ctrl);
    }
    notify(){
        this.forEach(ctrl => ctrl.listen(this));
    }
}

const HomeDetailModel = class extends Model{
    constructor(id, title, memo = ''){
        super();
        this._id = id;
        this._title = title;
        this._memo = memo;
    }
    get title() {return this._title};
    get id() {return this._id};
    get memo() {return this._memo};
    edit(title = '', memo = ''){
        this._title = title
        this._memo = memo
        this.notify();
    }
}

const HomeModel = class extends Model {
    constructor(isSingleton){
        super(isSingleton);
        if(!this._list) {
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
    get list() { return [...this._list]}

    add(...model){
        this._list.push(...model)
    }
    get(id){
        let result;
        if(!this._list.some(model => model.id == id ? (result = model) : false)) err();
        return result;
    }
    remove(id){
        const {_list:list} = this;
        if(!list.some((model,i) =>{
            if(model.id == id){
                list.splice(i,1);
                return true;
            }
        })) err();
        this.notify();  // 부모 Model의 notify로 이동 -> ctrl.listen(model) -> HomeModel:$list() -> app.route() -> 다 지우고 새로 그리기
    }
}

const View = class {
    constructor(controller, isSingleton = false){
        this._controller = controller;
        if(isSingleton) return singleton.getInstance(this);
    }
    render(model = null) { override() }
}

const HomeBaseView = class extends View {
    constructor(controller, isSingleton){
        super(controller, isSingleton);
    }
    render(model, _=type(model, HomeModel)) {
        const {_controller:ctrl } = this;
        return append(el('ul'), ...model.list.map(model => append(
            el('li'),
            el('a','innerHTML',model.title, 'addEventListener',['click',_=>ctrl.$detail(model.id)]),
            el('button','innerHTML','x','addEventListener',['click',_=>ctrl.$remove(model.id)])
        )))
    }
}

const HomeDetailView = class extends View {
    constructor(controller, isSingleton){
        super(controller, isSingleton);
    } 
    render(model, _=type(model, HomeDetailModel)){
        const {_controller:ctrl} = this;
        return append(el('section'),
            el('input','value',model.title,'className','title','@cssText','display:block'),
            el('textarea','innerHTML',model.memo,'className','memo','@cssText','display:block'),
            el('button','innerHTML','edit','addEventListener',['click',_=>ctrl.$editDetail(model.id, sel('.title').value, sel('.memo').value)]),
            el('button','innerHTML','delete','addEventListener',['click',_=>ctrl.$removeDetail(model.id)]),
            el('button','innerHTML','list','addEventListener',['click',_=>ctrl.$list()])
        )
    }
}

const Controller = class{
    constructor(isSingleton){
        if(isSingleton) return singleton.getInstance(this);
    }
    listen(model){}
}

const Home = class extends Controller {
    constructor(isSingleton){
        super(isSingleton);
    }
    base(){
        const view = new HomeBaseView(this, true);
        const model = new HomeModel(true);
        model.addController(this);
        return view.render(model);
    }
    detail(id){
        const view = new HomeDetailView(this, true);
        const model = new HomeModel(true);
        model.addController(this)
        return view.render(model.get(id));
    }
    
    $list(){
        app.route('home')
    }
    $detail(id){
        app.route('home:detail',id);
    }
    $remove(id){
        const model = new HomeModel(true);
        model.remove(id);
        this.$list();
    }
    $removeDetail(id){
        this.$remove(id);
        this.$list();
    }
    $editDetail(id, title, memo){
        const model = new HomeModel(true).get(id);
        model.addController(this);
        model.edit(title, memo)
    }
    listen(model){
        switch(true){
            case is(model, HomeModel): return this.$list();
            case is(model, HomeDetailModel): return this.$detail(model.id)
        }
    }
}

const App = class {
    constructor(parent){
        this._parent = parent;
        this._table = new Map();
    }
    add(route, controller){
        route = route.split(':')
        this._table.set(route[0],controller);  // home : ctrl
        (route[1] || '').split(',').concat('base').forEach(v =>{ // [detail, base]
            this._table.set(`${route[0]}:v`, controller); // [detail:v : ctrl][base:v : ctrl]
        })
    }
    route(path, ...arg){
        const [k, action = 'base'] = path.split(':') // home
        if(!this._table.has(k)) return;
        const controller = this._table.get(k)(); // home에 해당하는 controller 찾기
        append(el(sel(this._parent), 'innerHTML',''), controller[action](...arg)); // controller(detail)(...arg)

    }
}



const app = new App('#stage');
app.add('home:detail',_=>new Home(true));
app.route('home');
