document.addEventListener('DOMContentLoaded', () => {
    // --- Constants and State ---
    const DEFAULT_SIZE = 5; // Must match C code's #define
    let nodes = []; // Array to simulate struct StaticLinkedNode nodes[DEFAULT_SIZE];
    let used = [];  // Array to simulate int used[DEFAULT_SIZE];
    let listInitialized = false;

    // --- DOM Elements ---
    const nodesTableBody = document.getElementById('nodes-table').querySelector('tbody');
    const usedTableBody = document.getElementById('used-table').querySelector('tbody');
    const logicalListDiv = document.getElementById('logical-list');
    const logOutput = document.getElementById('log-output');
    const insertCharInput = document.getElementById('insert-char');
    const insertPosInput = document.getElementById('insert-pos');
    const deleteCharInput = document.getElementById('delete-char');
    const insertBtn = document.getElementById('btn-insert');
    const deleteBtn = document.getElementById('btn-delete');
    const resetBtn = document.getElementById('btn-reset');

    // --- Logging Function ---
    function log(message) {
        logOutput.textContent += message + '\n';
        logOutput.scrollTop = logOutput.scrollHeight; // Auto-scroll
        console.log(message); // Also log to browser console
    }

    // --- Core Logic (Simulating C functions) ---

    function initLinkedList() {
        log('Initializing Static Linked List...');
        nodes = [];
        used = [];
        for (let i = 0; i < DEFAULT_SIZE; i++) {
            // Initialize node structure
            nodes.push({ data: (i === 0) ? '\0' : '', next: (i === 0) ? -1 : 0 }); // Mimic C init state
            // Initialize used array
            used.push((i === 0) ? 1 : 0);
        }
        listInitialized = true;
        log(`List initialized with size ${DEFAULT_SIZE}. Head node at index 0.`);
        updateVisualization();
    }

    function findFreeSlot() {
        for (let i = 1; i < DEFAULT_SIZE; i++) { // Start from 1, 0 is head
            if (used[i] === 0) {
                return i;
            }
        }
        return -1; // Indicate no space found
    }

    function insertElement(char, position) {
        if (!listInitialized) {
            log("Error: List not initialized. Please Reset first.");
            return;
        }
        if (!char || position < 0) {
            log("Error: Invalid character or position for insertion.");
            return;
        }

        log(`Attempting to insert '${char}' at position ${position}...`);

        // Step 1: Search to the position (find predecessor p)
        let p = 0; // Start at head node
        let currentPos = 0;
        while (currentPos < position && nodes[p].next !== -1) {
            p = nodes[p].next;
            currentPos++;
        }

        // Check if position is valid
        if (currentPos < position) {
             log(`Error: The position ${position} is beyond the current scope of the list (length ${currentPos}).`);
             updateVisualization(); // Show current state
             return;
        }

        // Step 2: Allocate space (find free slot q)
        const q = findFreeSlot();
        if (q === -1) {
            log("Error: No space available in the static list.");
            updateVisualization();
            return;
        }

        log(`Space allocated at index ${q}.`);
        used[q] = 1;
        nodes[q].data = char;

        // Step 3: Link the node
        log(`Linking node ${q} after node ${p}...`);
        nodes[q].next = nodes[p].next; // New node points to what p was pointing to
        nodes[p].next = q;             // p now points to the new node

        log(`Successfully inserted '${char}' at index ${q} (logical position ${position}).`);
        updateVisualization([p, q]); // Highlight involved nodes
    }

    function deleteElement(char) {
         if (!listInitialized) {
            log("Error: List not initialized. Please Reset first.");
            return;
        }
         if (!char) {
            log("Error: Invalid character for deletion.");
            return;
        }

        log(`Attempting to delete first occurrence of '${char}'...`);

        let p = 0; // p is the *predecessor* of the node to delete
        let q = -1; // q will be the index of the node to delete

        // Find the predecessor p such that nodes[p].next points to the node with data == char
        while (nodes[p].next !== -1 && nodes[nodes[p].next].data !== char) {
            p = nodes[p].next;
        }

        // Check if the node was found
        if (nodes[p].next === -1) {
            log(`Cannot delete '${char}'. Character not found in the list.`);
            updateVisualization();
            return;
        }

        // Node found, q is the index to delete
        q = nodes[p].next;
        log(`Found '${char}' at index ${q}. Deleting...`);

        // Relink: p's next skips over q
        nodes[p].next = nodes[q].next;

        // Free the space: Mark q as unused
        used[q] = 0;
        // Optional: Clear data/next in the freed node for clarity
        nodes[q].data = '';
        nodes[q].next = 0; // Or some other indicator of "free"

        log(`Successfully deleted '${char}' from index ${q}. Space freed.`);
        updateVisualization([p, q]); // Highlight involved nodes
    }

    // --- Visualization Update Function ---
    function updateVisualization(highlightIndices = []) {
        if (!listInitialized) return;

        // Clear previous state
        nodesTableBody.innerHTML = '';
        usedTableBody.innerHTML = '';
        logicalListDiv.innerHTML = 'Head (0)'; // Start logical view

        const linkedPath = new Set();
        let current = nodes[0].next;
        while(current !== -1 && linkedPath.size <= DEFAULT_SIZE) { // Prevent infinite loops
             linkedPath.add(current);
             current = nodes[current].next;
        }

        // Populate tables
        for (let i = 0; i < DEFAULT_SIZE; i++) {
            // Nodes Table Row
            const nodeRow = nodesTableBody.insertRow();
            nodeRow.insertCell().textContent = i;
            nodeRow.insertCell().textContent = nodes[i].data === '\0' ? '(Head)' : nodes[i].data;
            nodeRow.insertCell().textContent = nodes[i].next;

            // Used Table Row
            const usedRow = usedTableBody.insertRow();
            usedRow.insertCell().textContent = i;
            usedRow.insertCell().textContent = used[i];

            // Apply CSS classes
            let nodeClass = '';
            if (i === 0) {
                nodeClass = 'node-head';
            } else if (used[i] === 1) {
                nodeClass = 'node-used';
                 if (linkedPath.has(i)) {
                     nodeClass += ' node-linked'; // Add linked class if part of the path
                 }
            } else {
                nodeClass = 'node-free';
            }
             if (highlightIndices.includes(i)) {
                 nodeClass += ' node-highlight-op'; // Highlight nodes involved in last op
             }

            nodeRow.className = nodeClass;
            usedRow.className = nodeClass; // Apply same background to used row for consistency
        }

         // Build Logical List String
         let logicalHTML = `<span class="node-repr">Head @ 0</span>`;
         current = nodes[0].next;
         const visited = new Set([0]); // Prevent cycles in display

         while (current !== -1 && !visited.has(current) && visited.size <= DEFAULT_SIZE) {
             visited.add(current);
             logicalHTML += ` <span class="arrow">-></span> <span class="node-repr">'${nodes[current].data}' @ ${current}</span>`;
             current = nodes[current].next;
         }
         if (current === -1) {
            logicalHTML += ` <span class="arrow">-></span> <span class="null">NULL (-1)</span>`;
         } else if (visited.has(current)) {
             logicalHTML += ` <span class="arrow">-></span> <span class="null" style="color:red;">CYCLE DETECTED to ${current}!</span>`;
         } else {
             logicalHTML += ` <span class="arrow">-></span> <span class="null" style="color:orange;">... (List too long or error)</span>`;
         }

         logicalListDiv.innerHTML = logicalHTML;
    }

    // --- Event Listeners ---
    insertBtn.addEventListener('click', () => {
        const char = insertCharInput.value;
        const pos = parseInt(insertPosInput.value, 10);
        insertElement(char, pos);
        insertCharInput.value = ''; // Clear input after use
    });

    deleteBtn.addEventListener('click', () => {
        const char = deleteCharInput.value;
        deleteElement(char);
        deleteCharInput.value = ''; // Clear input after use
    });

    resetBtn.addEventListener('click', () => {
        initLinkedList();
    });

    // --- Initial Load ---
    initLinkedList(); // Initialize on page load
});
