const Observer = class {
    observe(subject) {override()}
}

const ViewModelObserver = class extends Observer {
    constructor(viewModel){
        super();
        this._viewModel = viewModel;
    }
    observe(model){ this._viewModel.listen(model)}
}

const Subject = class extends Set{
    add(observer){
        super.add(observer)
        return this;
    }
    delete(observer){
        super.delete(observer)
    }
    has(observer){
        return super.has(observer)
    }
    notify(...arg){
        this.forEach(observer => arg.length ? observer.observe(...arg): observer.observe(this));
    }
}

// {vm, observer}
const ViewModel = class extends Subject {
    constructor(isSingleton) {
        super()
        const vm = isSingleton ? singleton.getInstance(this) : this;
        const _observer = new ViewModelObserver(vm);
        prop(vm,{_observer});
    }
    get observer() {return this._observer}
    listen(model){}
}

const ListVM = class extends ViewModel{
    constructor(isSingleton) {
        super(isSingleton)
    }
    base(){
        const model = new HomeModel(true);
        model.add(this.observer)
        model.notify();
    }
    listen(model){
        this.nofity(model.list)
    }
}

const App = class {
    constructor(parent) {
        this._parent = parent;
        this._table = new Map;
    }

    add(path, vm, view){
        this._table.set(path,[vm, view]);
    }
    route(path, ...arg){
        const [p, action = 'base'] = path.split(':');
        const [vm, view] = this._table.get(p).map(f => f());
        view.viewModel = vm;
        vm[action](...arg)
        append(el(sel(this._parent),'innerHTML',''), view.view);
    }
}


const app = new App("#stage");
app.add('list',_=> new ListVM(true),_=> new HomeBaseView(true))
app.add('detail',_=> new DetailVM(true),_=>new HomeDetailView(true))
app.route('list');