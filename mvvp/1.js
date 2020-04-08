const Observer = class {
    observe(v) {override()}
}

// {set}
const ViewModelObserver = class extends Observer{
    constructor(viewModel) {
        super();
        this._viewModel = viewModel;
    }
    observe(model){
        this._viewModel.listen(model)
    }
}

const View = class extends Observer{
    constructor(tag, isSingleton = false) {
        super();
        prop(isSingleton ? singleton.getInstance(this) : this, {_tag:tag})
    }

    get tag() { return this._tag}
    get viewModel() {return this._viewModel}
    set viewModel(_viewModel){
        prop(this, {_viewModel})
        _viewModel.add(this);
    }

    observe(...arg){this.render(...arg)}
    render(){override()}
}

const HomeBaseView = class extends View{
    constructor(isSinglton){
        super(el('ul'),isSinglton)
    }
    render(model){
        const {viewModel, tag} = this;
        append(el(tag,'innerHTML',''), ...model.map(m => append(
            el('li'),
            el('a','innerHTML',m.title)
        )))
    }
}

// -----------------------------------------------------------------------------



const Subject = class extends Set {
    add(observer){
        super.add(observer)
    }
    notify(...arg){
        this.forEach(observer => arg.length ? observer.observe(...arg) : observer.observe(this))
    }
}


const Model = class extends Subject {
    constructor(isSingleton) {
        super();
        if(isSingleton) return singleton.getInstance(this)
    }
}

const HomeModel = class extends Model{
    constructor(isSingleton){
        super(isSingleton)
        if(!this._list){
            prop(this, {_list : [
                new HomeDetailModel(1, 'todo1','memo1'),
                new HomeDetailModel(2, 'todo2','memo2'),
                new HomeDetailModel(3, 'todo3','memo3'),
            ]})
        }
    }
    get list() {return this._list}
}

const HomeDetailModel = class extends Model {
    constructor(id, title, memo) {
        super();
        this._id = id;
        this.edit(title, memo)
    }
    edit(title, memo){
        this._title = title,
        this._memo = memo
        this.notify();
    }
    get title() {return this._title}
}

// -----------------------------------------------------------------------------

// {set(), viewmodelobserver}
const ViewModel = class extends Subject{
    constructor(isSinglton){
        super();
        const target = isSinglton ? singleton.getInstance(this) : this;
        prop(target, {_observer: new ViewModelObserver(target)})
    }
    get observer(){return this._observer}

}
const ListVM = class extends ViewModel{
    constructor(isSinglton){
        super(isSinglton);
    }
    base(){
        const model = new HomeModel(true);      // model 생성
        model.add(this.observer)                // model에 observer 등록    
        model.notify();                         // notify로 observer 실행
    }
    listen(model){
        this.notify(model.list)
    }
}

// -----------------------------------------------------------------------------

const App = class{
    constructor(parent) {
        this._parent= parent;
        this._table= new Map; 
    }
    add(path, vm, view){
        this._table.set(path,[vm,view])
    }
    route(path,...arg){
        const [p, action='base'] = path.split(':');
        const [vm, view] = this._table.get(p).map(f => f());
        view.viewModel = vm;
        vm[action](...arg);
        append(el(sel(this._parent),'innerHTML',''), view.tag);
    }
}

const app = new App("#stage");
app.add('list',_=>new ListVM(true),_=>new HomeBaseView(true));
app.add('detail',_=>new DetailVM(true),_=>new HomeDetailView(true));
app.route('list');