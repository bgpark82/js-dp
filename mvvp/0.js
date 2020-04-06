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


const Observer = class {
    observe(v) {override();}
}

const Subject = class extends Set {
    add(observer, _=type(observer,Observer)){
        super.add(observer);
        return this;
    }
    delete(observer, _=type(observer,Observer)){
        super.delete(observer);
    }
    has(observer, _=type(observer,Observer)){
        return super.has(observer);
    }
    notify(...arg){
        this.forEach(observer => arg.length ? observer.observe(...arg) : observer.observe(this))
    }
}

const Model = class extends Subject {
    constructor(isSingleton){
        super();
        if(isSingleton) return singleton.getInstance(this)
    }
}

const View = class extends Observer {
    constructor(view, isSingleton){
        super();
        this.isSingleton = (isSingleton) ? singleton.getInstance(this) : this,
        this._view = view;
    }
    get view() {return this._view}
    get viewModel(){return this._viewModel;}
    set viewModel(_viewModel){
        Object.assign(this,{_viewModel})
        _viewModel.add(this);
    }

    observe(...arg){this.render(...arg)}
    render() {override()}
}

const ViewModelObserver = class extends Observer {
    constructor(viewModel){
        super();
        this._viewModel = viewModel;
    }
    observe(v){this._viewModel.listen(v)};
}

const ViewModel = class extends Subject {
    constructor(isSingleton){
        super();
        const target = isSingleton ? singleton.getInstance(this) : this;
        Object.assign(target, {_observer:new ViewModelObserver(target)})
        return target;
    }
    get observer(){return this._observer;}
    listen(model){}
}

const HomeBaseView = class extends View {
    constructor(isSingleton){
        super(el('ul'),isSingleton);
    }
    render(v){
        const {viewModel,view} = this;
        append(el(view, 'innerHTML',''), ...v.map(v => append(
            el('li'),
            el('a','innerHTML',v.title,'addEventListener',
                ['click',_=>viewModel.$detail(v.id)]),
            el('button','innerHTML','x','addEventListener',
                ['click',_=>viewModel.$remove(v.id)])
        )))
    }
}

const HomeDetailModel = class extends Model {
    constructor(_id, title, memo){
        super()
        this._id = _id;
        this.edit(title, memo)
    }
    edit(_title, _memo){
        this._title = _title;
        this._memo = _memo;
        this.notify()
    }
    get title(){return this._title}
    get id(){return this._id}
    get memo(){return this._memo}
}

const HomeModel =  class extends Model {
    constructor(isSingleton){
        super(isSingleton)
        if(!this._list){
            Object.assign(this, {_list:[
                new HomeDetailModel(1,'todo1','memo1'),
                new HomeDetailModel(2,'todo2','memo2'),
                new HomeDetailModel(3,'todo3','memo3'),
                new HomeDetailModel(4,'todo4','memo4'),
                new HomeDetailModel(5,'todo5','memo5'),
            ]})
        }
    }
    get list() {return this._list}
    remove(id){
        const {_list:list} = this;
        if(!list.some((v,i)=>{
            if(v.id == id){
                list.splice(i,1);
                return true;
            }
        })) err()
        this.notify()
    }
    get(id){
        let result;
        if(!this._list.some(v => v.id == id ? (result = v) : false)) err()
        return result;
    }
}

const ListVM =  class extends ViewModel {
    constructor(isSingleton){
        super(isSingleton);
    }
    base(){
        const model = new HomeModel(true);
        model.add(this.observer);
        model.notify();  // model.notify() ->  .listen(model) -> 
    }
    listen(model,_=type(model,HomeModel)){
        this.notify(model.list);
    }
    $detail(id){
        app.route('detail',id)
    }
    $remove(id){
        const model = new HomeModel(true);
        model.remove(id);
    }
}

const DetailVM = class extends ViewModel {
    constructor(isSingleton){
        super(isSingleton)
    }
    base(id){
        this._id = id;
        const model = new HomeModel(true).get(id);
        model.add(this.observer);
        model.notify();
    }
    listen(model, _=type(model, HomeDetailModel)){
        this.notify(model.title,model.memo)
    }
    $remove(){
        const model = new HomeModel(true);
        model.remove(this._id);
        this.$list();
    }
    $edit(title, memo){
        const model = new HomeModel(true).get(this._id);
        model.edit(title,memo);
    }
    $list(){app.route('list')}
}

const HomeDetailView =  class extends View {
    constructor(isSingleton){
        super(el('section'), isSingleton);
        const {view} = this;
        append(el(view,'innerHTML',''),
            el('input','className','title','@cssText','display:block'),
            el('textarea','className','memo','@cssText','display:block'),
            el('button','innerHTML','edit','addEventListener',
                ['click',_=>this.viewModel.$edit(sel('.title',view).value,sel('.memo',view).value)]),
            el('button','innerHTML','delete','addEventListener',
                ['click',_=>this.viewModel.$remove()]),
            el('button','innerHTML','list','addEventListener',
                ['click',_=>this.viewModel.$list()]),

        )
    }
    render(title, memo){
        const t = sel('.title',this.view)
        t.value = title;
        sel('.memo',this.view).value = memo;
    }
}

const App = class {
    constructor(parent){
        this._parent = parent;
        this._table = new Map;
    }

    // table: { path, [vm,view] }
    add(path, vm, view){
        this._table.set(path,[vm,view])
    }
    route(path, ...arg){
        const [p, action = 'base'] = path.split(":");
        if(!this._table.has(p)) return;
        const [vm, view] = this._table.get(p).map(f => f())
        view.viewModel = vm;
        vm[action](...arg);
        append(el(sel(this._parent), 'innerHTML',''), view.view);
    }
}

const app = new App("#stage");
app.add('list',_=>new ListVM(true), _=>new HomeBaseView(true));
app.add('detail',_=>new DetailVM(true), _=>new HomeDetailView(true));
app.route('list')
