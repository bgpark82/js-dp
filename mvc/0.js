const Model = class extends Set{
    constructor(isSingleton){
        super();
        if(isSingleton) return isSingleton.getInstance(this);
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
        this.forEach(model => model.listen(this));
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
}

const HomeModel = class extends Model {
    constructor(isSingleton){
        super(isSingleton);
        if(!this._list) {
            _list :[
                new HomeDetailModel(1, 'todo1','memo1'),
                new HomeDetailModel(2, 'todo2','memo2'),
                new HomeDetailModel(3, 'todo3','memo3'),
                new HomeDetailModel(4, 'todo4','memo4'),
                new HomeDetailModel(5, 'todo5','memo5'),
                new HomeDetailModel(6, 'todo6','memo6')
            ]
        }
    }

    add(...model){this._list.push(...model)}
    remove(id){
        const {_list:list} = this;
        if(!list.some((model,i) =>{
            if(model.id == id){
                list.splice(i,1);
                return true;
            }
        }))
        this.notify();
    }

}