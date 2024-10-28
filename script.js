const cy = cytoscape({
    container: document.getElementById('cy'),
    elements: [
        { data: { id: 'a', color: 'blue' } },
        { data: { id: 'b', color: 'blue' } },
    ],
    style: [
        {
            selector: 'node',
            style: {
                'background-color': 'data(color)',
                'label': 'data(id)',
                'color': '#ffffff', // Change text color to white
                'text-valign': 'center',
                'text-halign': 'center',
                'width': '40px',
                'height': '40px',
            }
        },
        {
            selector: 'edge',
            style: {
                'width': 3,
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle',
            }
        }
    ],
    layout: {
        name: 'grid',
        rows: 1
    }
});
// Function to generate a random color

function getRandomColor() {

    const letters = '0123456789ABCDEF';

    let color = '#';

    for (let i = 0; i < 6; i++) {

        color += letters[Math.floor(Math.random() * 16)];

    }

    return color;

}


// Topology functions

// Function to create the default playground topology

function createPlaygroundTopology() {

    cy.elements().remove(); // Clear existing elements

    const nodes = [];

    const edges = [];


    // Create a set of nodes

    for (let i = 1; i <= 2; i++) {

        nodes.push({ data: { id: 'node' + i, color: getRandomColor() } });

    }

    cy.add(nodes);

    cy.add(edges);

    cy.fit(); // Fit the view to include all nodes

}



function createStarTopology() {

    cy.elements().remove(); // Clear existing elements

    const centerNode = { data: { id: 'center', color: 'blue' } };

    const nodes = [centerNode];

    const edges = [];


    for (let i = 1; i <= 5; i++) {

        const node = { data: { id: 'node' + i, color: getRandomColor() } };

        nodes.push (node);

        edges.push({ data: { id: 'edge' + i, source: 'center', target: 'node' + i } });

    }


    cy.add(nodes);

    cy.add(edges);

    cy.fit(); // Fit the view to include all nodes

}


function createRingTopology() {

    cy.elements().remove(); // Clear existing elements

    const nodes = [];

    const edges = [];


    for (let i = 1; i <= 5; i++) {

        nodes.push({ data: { id: 'node' + i, color: getRandomColor() } });

    }


    for (let i = 1; i <= 5; i++) {

        edges.push({ data: { id: 'edge' + i, source: 'node' + i, target: 'node' + ((i % 5) + 1) } });

    }


    cy.add(nodes);

    cy.add(edges);

    cy.fit(); // Fit the view to include all nodes

}


function createMeshTopology() {

    cy.elements().remove(); // Clear existing elements

    const nodes = [];

    const edges = [];


    for (let i = 1; i <= 5; i++) {

        nodes.push({ data: { id: 'node' + i, color: getRandomColor() } });

    }


    for (let i = 1; i <= 5; i++) {

        for (let j = i + 1; j <= 5; j++) {

            edges.push({ data: { id: 'edge' + i + '-' + j, source: 'node' + i, target: 'node' + j } });

        }

    }


    cy.add(nodes);

    cy.add(edges);

    cy.fit(); // Fit the view to include all nodes

}


function createBusTopology() {

    cy.elements().remove(); // Clear existing elements

    const nodes = [];

    const edges = [];


    for (let i = 1; i <= 5; i++) {

        nodes.push({ data: { id: 'node' + i, color: getRandomColor() } });

        if (i > 1) {

            edges.push({ data: { id: 'edge' + (i - 1), source: 'node' + (i - 1), target: 'node' + i } });

        }

    }


    cy.add(nodes);

    cy.add(edges);

    cy.fit(); // Fit the view to include all nodes

}


function createTreeTopology() {

    cy.elements().remove(); // Clear existing elements

    const nodes = [];

    const edges = [];


    nodes.push({ data: { id: 'root', color: 'blue' } });

    for (let i = 1; i <= 5; i++) {

        nodes.push({ data: { id: 'node' + i, color: getRandomColor() } });

        edges.push({ data: { id: 'edge' + i, source: 'root', target: 'node' + i } });

    }


    cy.add(nodes);

    cy.add(edges);

    cy.fit(); // Fit the view to include all nodes

}


// Event listeners for the tabs

document.querySelectorAll('.tab-button').forEach(button => {

    button.addEventListener('click', () => {

        const topologyType = button.getAttribute('data-topology');

        switch (topologyType) {

             case 'playground':

                createPlaygroundTopology();

                break;

            case 'star':

                createStarTopology();

                break;

            case 'ring':

                createRingTopology();

                break;

            case 'mesh':

                createMeshTopology();

                break;

            case 'bus':

                createBusTopology();

                break;

            case 'tree':

                createTreeTopology();

                break;

            default:

                console.error(`Unknown topology type: ${topologyType}`);

        }

    });

});

// Function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}



// History stacks for undo and redo
let history = [];
let redoStack = [];

// Function to save the current state
function saveState() {
    const elements = cy.json().elements;
    history.push(elements);
    redoStack = []; // Clear redo stack on new action
}

// Function to restore a state
function restoreState(elements) {
    cy.elements().remove();
    cy.add(elements);
}

// Function to add a new edge interactively
let selectedNode = null;

cy.on('tap', 'node', function(evt) {
    const node = evt.target;

    if (selectedNode) {
        // If a node is already selected, create an edge
        saveState(); // Save state before action
        cy.add({
            group: 'edges',
            data: {
                id: selectedNode.id() + '-' + node.id(),
                source: selectedNode.id(),
                target: node.id()
            }
        });
        selectedNode = null; // Reset selection
    } else {
        // Select the node
        selectedNode = node;
        node.addClass('selected'); // Optional: Add a class for styling
    }
});

// Optional: Style for selected nodes
cy.style()
    .selector('.selected')
    .style({
        'background-color': 'red',
        'border-width': '2px',
        'border-color': 'yellow'
    })
    .update();

// Add Node Button
document.getElementById('addNodeBtn').addEventListener('click', function() {
    const newNodeId = 'n' + (cy.nodes().length + 1);
    saveState(); // Save state before action
    cy.add({
        group: 'nodes',
        data: { id: newNodeId, color: getRandomColor() }
    });
});

// Delete Node Button
document.getElementById('deleteNodeBtn').addEventListener('click', function() {
    if (selectedNode) {
        saveState(); // Save state before action
        cy.remove(selectedNode);
        selectedNode = null;
    }
});
// Fit to View Button

document.getElementById('fitToViewBtn').addEventListener('click', function() {

    cy.fit(); // Fit the view to include all nodes

});
// Reset Button
document.getElementById('resetBtn').addEventListener('click', function() {
    saveState(); // Save state before action
    cy.elements().remove(); // Remove all existing elements
    cy.add([
        { data: { id: 'a', color: 'blue' } },
        { data: { id: 'b', color: 'red' } },
    ]); // Add default nodes

    // Center the view on the newly added nodes
    cy.center(); // Center the graph view
});

// Undo Button
document.getElementById('undoBtn').addEventListener('click', function() {
    if (history.length > 0) {
        const lastState = history.pop();
        redoStack.push(cy.json().elements); // Save current state to redo stack
        restoreState(lastState);
    }
});
// Redo Button

document.getElementById('redoBtn').addEventListener('click', function() {

    if (redoStack.length > 0) {

        const nextState = redoStack.pop();

        saveState(); // Save current state before redo

        restoreState(nextState);

    }

});

// Help Button
document.getElementById('helpBtn').addEventListener('click', function() {
    document.getElementById('helpModal').style.display = 'block'; // Show the modal
});

// Close Modal
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('helpModal').style.display = 'none'; // Hide the modal
});

// Close Modal when clicking outside of it
window.addEventListener('click', function(event) {
    const modal = document.getElementById('helpModal');
    if (event.target === modal) {
        modal.style.display = 'none'; // Hide the modal if clicked outside
    }
});

// Dark mode toggle functionality
const toggleThemeBtn = document.getElementById('toggleThemeBtn');

toggleThemeBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode'); // Toggle the dark-mode class on the body
});

cy.add({
    group: 'nodes',
    data: { id: newNodeId, color: getRandomColor() },
    classes: 'node' // Add the 'node' class
});

cy.add({
    group: 'edges',
    data: {
        id: selectedNode.id() + '-' + node.id(),
        source: selectedNode.id(),
        target: node.id()
    },
    classes: 'edge' // Add the 'edge' class
});


// Function to smoothly zoom out

function zoomOut() {

    const currentZoom = cy.zoom();

    const newZoom = currentZoom * 0.8; // Adjust the zoom factor as needed


    cy.animate({

        zoom: newZoom,

        position: cy.center() // Center the graph during zoom

    }, {

        duration: 500 // Duration of the zoom animation in milliseconds

    });

}


//