function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree, container);
}
function setupComponent(instance) {
    // initProps()
    // initSlot()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const component = instance.type;
    const setupResult = component.setup();
    handleSetupResult(instance, setupResult);
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentRender(instance);
}
function finishComponentRender(instance) {
    const component = instance.type;
    instance.render = component.render;
}
function createComponentInstance(vnode) {
    const instance = {
        type: vnode.type,
        vnode
    };
    return instance;
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    if (typeof vnode === 'object') {
        processComponent(vnode, container);
    }
    else if (typeof vnode === 'string') {
        processElement(vnode, container);
    }
}
function processElement(vnode, container) {
    const { type, props, children } = vnode;
    const el = document.createElement(type);
    if (children) {
        for (const v of children) {
            patch(v, container);
        }
    }
    if (props) {
        for (const key in props) {
            const val = props[key];
            el.setAttribute(key, val);
        }
    }
    container.append(el);
}

function createVnode(type, props, children) {
    const vnode = {
        type, props, children
    };
    return vnode;
}

function createApp(rootComponent) {
    const vnode = createVnode(rootComponent);
    return {
        mount(rootContainer) {
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

export { createApp, h };
