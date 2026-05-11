const NODE_COUNT = 5;

const topologyLayouts = {
    playground: { name: 'grid', rows: 1, padding: 70 },
    star: { name: 'circle', padding: 70 },
    ring: { name: 'circle', padding: 70 },
    mesh: { name: 'circle', padding: 70 },
    bus: { name: 'grid', rows: 1, padding: 70 },
    tree: { name: 'breadthfirst', directed: true, padding: 70, spacingFactor: 1.35 },
};

const cy = cytoscape({
    container: document.getElementById('cy'),
    elements: [],
    style: [
        {
            selector: 'node',
            style: {
                'background-color': 'data(color)',
                'border-color': '#ffffff',
                'border-width': 2,
                'color': '#ffffff',
                'font-size': 13,
                'font-weight': 700,
                'height': 48,
                'label': 'data(label)',
                'text-halign': 'center',
                'text-valign': 'center',
                'width': 48,
            },
        },
        {
            selector: 'node.selected',
            style: {
                'background-color': '#d64550',
                'border-color': '#f6d365',
                'border-width': 4,
            },
        },
        {
            selector: 'edge',
            style: {
                'curve-style': 'bezier',
                'line-color': '#73808c',
                'target-arrow-color': '#73808c',
                'target-arrow-shape': 'triangle',
                'width': 3,
            },
        },
    ],
    layout: topologyLayouts.playground,
});

let selectedNode = null;
let history = [];
let redoStack = [];

function getRandomColor() {
    const colors = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function node(id, color = getRandomColor()) {
    return { data: { id, label: id, color } };
}

function edge(source, target) {
    return {
        data: {
            id: `${source}-${target}`,
            source,
            target,
        },
    };
}

function snapshotElements() {
    return cy.elements().map((element) => element.json());
}

function saveState() {
    history.push(snapshotElements());
    redoStack = [];
}

function restoreState(elements) {
    selectedNode = null;
    cy.elements().remove();
    cy.add(elements);
    cy.layout({ name: 'preset' }).run();
}

function runLayout(type) {
    cy.layout(topologyLayouts[type] || topologyLayouts.playground).run();
    cy.fit(undefined, 50);
}

function loadTopology(type, shouldSave = true) {
    if (shouldSave) {
        saveState();
    }

    selectedNode = null;
    cy.elements().remove();
    cy.add(createTopology(type));
    runLayout(type);
    setActiveTab(type);
}

function createTopology(type) {
    switch (type) {
        case 'star':
            return createStarTopology();
        case 'ring':
            return createRingTopology();
        case 'mesh':
            return createMeshTopology();
        case 'bus':
            return createBusTopology();
        case 'tree':
            return createTreeTopology();
        case 'playground':
        default:
            return [node('node1', '#2563eb'), node('node2', '#059669')];
    }
}

function createStarTopology() {
    const elements = [node('center', '#2563eb')];

    for (let i = 1; i <= NODE_COUNT; i += 1) {
        const id = `node${i}`;
        elements.push(node(id), edge('center', id));
    }

    return elements;
}

function createRingTopology() {
    const elements = [];

    for (let i = 1; i <= NODE_COUNT; i += 1) {
        elements.push(node(`node${i}`));
    }

    for (let i = 1; i <= NODE_COUNT; i += 1) {
        elements.push(edge(`node${i}`, `node${(i % NODE_COUNT) + 1}`));
    }

    return elements;
}

function createMeshTopology() {
    const elements = [];

    for (let i = 1; i <= NODE_COUNT; i += 1) {
        elements.push(node(`node${i}`));
    }

    for (let i = 1; i <= NODE_COUNT; i += 1) {
        for (let j = i + 1; j <= NODE_COUNT; j += 1) {
            elements.push(edge(`node${i}`, `node${j}`));
        }
    }

    return elements;
}

function createBusTopology() {
    const elements = [];

    for (let i = 1; i <= NODE_COUNT; i += 1) {
        const id = `node${i}`;
        elements.push(node(id));

        if (i > 1) {
            elements.push(edge(`node${i - 1}`, id));
        }
    }

    return elements;
}

function createTreeTopology() {
    const elements = [node('root', '#2563eb')];

    for (let i = 1; i <= NODE_COUNT; i += 1) {
        const id = `node${i}`;
        elements.push(node(id), edge('root', id));
    }

    return elements;
}

function setActiveTab(type) {
    document.querySelectorAll('.tab-button').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.topology === type);
    });
}

function clearSelection() {
    if (selectedNode) {
        selectedNode.removeClass('selected');
        selectedNode = null;
    }
}

function nextNodeId() {
    let index = cy.nodes().length + 1;
    let id = `node${index}`;

    while (cy.getElementById(id).length) {
        index += 1;
        id = `node${index}`;
    }

    return id;
}

function addNode() {
    saveState();

    const id = nextNodeId();
    const extent = cy.extent();
    cy.add({
        group: 'nodes',
        data: { id, label: id, color: getRandomColor() },
        position: {
            x: (extent.x1 + extent.x2) / 2,
            y: (extent.y1 + extent.y2) / 2,
        },
    });
}

function connectNodes(source, target) {
    if (source.id() === target.id()) {
        clearSelection();
        return;
    }

    const edgeId = `${source.id()}-${target.id()}`;
    const reverseEdgeId = `${target.id()}-${source.id()}`;

    if (cy.getElementById(edgeId).length || cy.getElementById(reverseEdgeId).length) {
        clearSelection();
        return;
    }

    saveState();
    cy.add(edge(source.id(), target.id()));
    clearSelection();
}

document.querySelectorAll('.tab-button').forEach((button) => {
    button.addEventListener('click', () => loadTopology(button.dataset.topology));
});

cy.on('tap', 'node', (event) => {
    const tappedNode = event.target;

    if (selectedNode) {
        connectNodes(selectedNode, tappedNode);
        return;
    }

    selectedNode = tappedNode;
    selectedNode.addClass('selected');
});

cy.on('tap', (event) => {
    if (event.target === cy) {
        clearSelection();
    }
});

document.getElementById('addNodeBtn').addEventListener('click', addNode);

document.getElementById('deleteNodeBtn').addEventListener('click', () => {
    if (!selectedNode) {
        return;
    }

    saveState();
    cy.remove(selectedNode);
    selectedNode = null;
});

document.getElementById('fitToViewBtn').addEventListener('click', () => cy.fit(undefined, 50));

document.getElementById('resetBtn').addEventListener('click', () => loadTopology('playground'));

document.getElementById('undoBtn').addEventListener('click', () => {
    if (!history.length) {
        return;
    }

    redoStack.push(snapshotElements());
    restoreState(history.pop());
});

document.getElementById('redoBtn').addEventListener('click', () => {
    if (!redoStack.length) {
        return;
    }

    history.push(snapshotElements());
    restoreState(redoStack.pop());
});

const modal = document.getElementById('helpModal');
document.getElementById('helpBtn').addEventListener('click', () => {
    modal.classList.add('is-open');
});

document.querySelector('.close').addEventListener('click', () => {
    modal.classList.remove('is-open');
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.classList.remove('is-open');
    }
});

document.getElementById('toggleThemeBtn').addEventListener('click', (event) => {
    const isDark = document.body.classList.toggle('dark-mode');
    event.currentTarget.textContent = isDark ? 'Light' : 'Dark';
    event.currentTarget.setAttribute('aria-pressed', String(isDark));
});

loadTopology('playground', false);
