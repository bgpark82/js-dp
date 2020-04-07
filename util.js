const type = (target, type) => {
    if(typeof target == "string"){
        if(typeof target != type) throw `invalid type ${target} : ${type}`;
    } else if(!(target instanceof type)) throw `invalid type ${target} : ${type}`
    return target; 
}

const sel = (target, el = document) => el.querySelector(target);

const el = (target, ...attr) => {
    const el = typeof target == "string" ? document.createElement(target) : target;
    for(let i = 0; i < attr.length;){
        const key = attr[i++];
        const value = attr[i++];
        if(typeof el[key] == "function") {
            el[key](...(Array.isArray(value) ? value : [value]));
        } else if(key[0] == "@") el.style[key.substr(1)] = value
        else el[key] = value;
        
    }
    return el;
}

const prop = (target, obj) => Object.assign(target, obj);

const valid = (data) => {
    if(data == "null" || data == "undefined" || data == "")
        throw `invalid ${data}`
    return data;
} 

const err = v => {throw v};
const override = _=> err('override');

const append = (parent, ...children) => {
    children.forEach(child => {
        parent.appendChild(child);
    })
    return parent
}

const is = (target, type) => {
    return target instanceof type
}

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
