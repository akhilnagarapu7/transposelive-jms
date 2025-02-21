  <script>
    const inputTextArea = document.getElementById('inputTextArea');
    const semitoneValue = document.getElementById('semitoneValue');
    const transposeMinus = document.getElementById('transposeMinus');
    const transposePlus = document.getElementById('transposePlus');
    const resetButton = document.getElementById('resetButton');
    const accidentals = document.getElementsByName('accidental');
    const modes = document.getElementsByName('mode');
    const printBtn = document.getElementById('printBtn');
    const saveBtn = document.getElementById('saveBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    const nameInput = document.getElementById('username');
    const keyInput = document.getElementById('key');
    const timeInput = document.getElementById('time');

    let semitones = 0;
    let originalText = '';
    let accidentalPreference = 'sharp';
    let modePreference = 'notes';

    const sharpNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

    function transposeNote(note, shift) {
        const notes = accidentalPreference === 'sharp' ? sharpNotes : flatNotes;
        const index = sharpNotes.indexOf(note) !== -1 ? sharpNotes.indexOf(note) : flatNotes.indexOf(note);
        if (index === -1) return note;

        const transposedIndex = (index + shift + 12) % 12;
        return notes[transposedIndex];
    }

    function transposeText(text, shift) {
        return text.replace(/([A-G][#b]*)([\(\)\[\]]?)(maj7|m7|m|dim|aug|sus2|sus4|add9|7|6|9|11|13)?/g, (match, note, octave, extension) => {
            return transposeNote(note, shift) + (octave || '') + (extension || '');
        });
    }

    function applyAccidentalPreference(text) {
        return text.replace(/([A-G][#b]*)([\(\)\[\]]?)(maj7|m7|m|dim|aug|sus2|sus4|add9|7|6|9|11|13)?/g, (match, note, octave, extension) => {
            const index = sharpNotes.indexOf(note) !== -1 ? sharpNotes.indexOf(note) : flatNotes.indexOf(note);
            if (index === -1) return match;

            const notes = accidentalPreference === 'sharp' ? sharpNotes : flatNotes;
            return notes[index] + (octave || '') + (extension || '');
        });
    }
function formatText(text) {
    // Check if the text contains '|' characters to determine if table formatting is needed
    if (!text.includes('|')) {
        return applyColorAndDots(text).replace(/\n/g, '<br>');
    }

    // Split the text into lines
    const lines = text.split('\n');
    
    // Find the maximum number of columns across all lines
    let maxCols = 0;
    const tableData = lines.map(line => {
        const cols = line.split('|').map(col => col.trim());
        maxCols = Math.max(maxCols, cols.length);
        return cols;
    });

    // Ensure all rows have equal number of columns
    tableData.forEach(row => {
        while (row.length < maxCols) {
            row.push(''); // Pad empty columns
        }
    });

    // Determine the maximum width per column
    const colWidths = new Array(maxCols).fill(0);
    tableData.forEach(row => {
        row.forEach((col, i) => {
            colWidths[i] = Math.max(colWidths[i], col.length);
        });
    });

    // Ensure each column is the same width by using a fixed-length monospaced font approach
    const formattedLines = tableData.map(row => {
        return row.map((col, i) => {
            const paddedCol = col.padEnd(colWidths[i], ' ');
            return `<span class='table-cell' style='display: inline-block; width: ${colWidths[i] * 10}px'>${applyColorAndDots(paddedCol)}</span>`;
        }).join('<span class="table-separator">|</span>');
    });

    return formattedLines.join('<br>');
}

function applyColorAndDots(text) {
    return text.replace(
        /([A-G])([#b]?)(['.]?)(maj7|m7|m|dim|aug|sus2|sus4|add9|7|6|9|11|13)?/g,
        (match, note, accidental, sign, extension) => {
            const colorClass = modePreference === 'notes' ? 'blue-notes' : 'red-chords';
            
            let formattedNote = `<span class="note-wrapper">${note}`;
            if (accidental === '#') {
                formattedNote += `<span class="sharp">#</span>`;
            } else if (accidental === 'b') {
                formattedNote += `<span class="flat">b</span>`;
            }
            formattedNote += `</span>`;

            return `<span class="${colorClass} note-group">${formattedNote}${sign.replace("+", "'").replace("-", ".")}${extension ? `<span class="${colorClass}">${extension}</span>` : ''}</span>`;
        }
    );
}

// Force desktop mode on mobile with a longer width
if (window.innerWidth < 768) {
    document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=1024');
}

// Fix single-click to edit issue
document.addEventListener('DOMContentLoaded', function() {
    const inputTextArea = document.getElementById('inputTextArea');
    let isEditing = false;

    inputTextArea.style.minHeight = '600px'; // Increase vertical length
    inputTextArea.style.maxHeight = 'none'; // Remove max-height restriction

    inputTextArea.addEventListener('click', function() {
        if (!isEditing) {
            isEditing = true;
            inputTextArea.contentEditable = 'true';
            inputTextArea.focus();
        }
    });

    inputTextArea.addEventListener('input', function() {
        originalText = inputTextArea.innerText;
    });

    document.addEventListener('click', function(event) {
        if (isEditing && !inputTextArea.contains(event.target)) {
            isEditing = false;
            inputTextArea.contentEditable = 'false';
        }
    });
});

    

// CSS to ensure proper styling
const style = document.createElement('style');
style.innerHTML = `
    .table-cell {
        text-align: center;
        padding: 0 10px;
        white-space: pre;
    }
    .table-separator {
        display: inline-block;
        font-weight: bold;
        padding: 0 5px;
    }
    .blue-notes { color: blue; }
    .red-chords { color: red; }
    .dot { font-size: 0.8em; font-weight: bold; color: inherit; position: relative; }
    .dot-above { top: -0.8em; }
    .dot-below { bottom: -0.8em; }
    .sharp, .flat { font-size: 0.8em; vertical-align: super; }
    #inputTextArea {
        font-family: monospace;
        white-space: pre;
    }
`;
document.head.appendChild(style);

// Update transposition and formatting logic
function updateTransposition() {
    let currentText = transposeText(originalText, semitones);
    currentText = applyAccidentalPreference(currentText);
    inputTextArea.innerHTML = formatText(currentText);
    placeCaretAtEnd(inputTextArea);
}



    function updateTransposition() {
        let currentText = transposeText(originalText, semitones);
        currentText = applyAccidentalPreference(currentText);
        inputTextArea.innerHTML = formatText(currentText);
        placeCaretAtEnd(inputTextArea); // Move caret after formatting
    }

    function placeCaretAtEnd(el) {
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    function handleTransposeClick(direction) {
        if (direction === 'minus') {
            if (semitones > -12) {
                semitones--;
                semitoneValue.value = semitones;
                updateTransposition();
            }
        } else if (direction === 'plus') {
            if (semitones < 12) {
                semitones++;
                semitoneValue.value = semitones;
                updateTransposition();
            }
        }
    }

    function reset() {
        semitones = 0;
        semitoneValue.value = 0;
        inputTextArea.innerHTML = originalText;
        updateTransposition();
    }

    function handleInputChange() {
        if (semitones === 0) {
            originalText = inputTextArea.innerText;
        } else {
            const currentText = inputTextArea.innerText;
            originalText = transposeText(currentText, -semitones);
        }
    }

function printOutput() {
    const name = document.getElementById('username').value.trim();
    const key = document.getElementById('key').value.trim();
    const keySignature = document.getElementById('time').value.trim();
    const outputContent = document.getElementById('inputTextArea').innerHTML;

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Print Output</title>');
    printWindow.document.write('<style>');

    // Global styles for printed page
    printWindow.document.write('@page { size: A4; margin: 1cm; }');
    printWindow.document.write('body { font-weight: bold; font-family: monospace; white-space: pre; }');

    // Ensure colors and symbols are preserved for printing
    printWindow.document.write('.blue-notes { color: blue; }');
    printWindow.document.write('.red-chords { color: red; }');
    printWindow.document.write('.sharp { font-size: 0.8em; vertical-align: super; }');
    printWindow.document.write('.flat { font-size: 0.8em; vertical-align: sub; }');
    printWindow.document.write('.dot { font-size: 0.8em; font-weight: bold; color: inherit; position: relative; display: inline-block; line-height: 1; }');
    printWindow.document.write('.dot-above, .dot-below { position: absolute; left: 50%; transform: translateX(-50%); white-space: nowrap; line-height: 1; }');
    printWindow.document.write('.dot-above { top: -1em; }');
    printWindow.document.write('.dot-below { bottom: -1em; }');
    printWindow.document.write('.table-cell { text-align: center; display: inline-block; padding: 0 10px; white-space: nowrap; position: relative; vertical-align: middle; line-height: 1; }');
    printWindow.document.write('.table-separator { display: inline-block; font-weight: bold; padding: 0 5px; }');

    // Additional print styles
    printWindow.document.write('.content-container { padding: 1cm; white-space: pre; margin: 0; box-sizing: border-box; text-align: justify; line-height: 1.4; }');
    printWindow.document.write('.header, .footer { text-align: center; font-size: 0.8em; position: fixed; width: 100%; background-color: white; box-sizing: border-box; }');
    printWindow.document.write('.header { top: 0; padding: 5px 0; border-bottom: 1px solid black; font-size: 1em; }');
    printWindow.document.write('.footer { bottom: 0; padding: 5px 0; border-top: 1px solid black; }');

    printWindow.document.write('</style></head><body>');

    // Header
    printWindow.document.write('<div class="header">Praise the LORD</div>');

    // Content inside the borders
    printWindow.document.write('<div class="content-container">');
    printWindow.document.write(`<h1 style="text-align: center; margin-top: 0;">${name} - ${key} - ${keySignature}</h1>`);
    printWindow.document.write('<hr style="border: none; border-bottom: 2px solid black; margin: 10px 0;">');
    printWindow.document.write(outputContent);
    printWindow.document.write('</div>');

    // Footer
    printWindow.document.write('<div class="footer">Sing to Him a new song; Play skillfully with a shout of joy. Psalm 33:3</div>');

    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}


function saveAndExport() {
    const name = document.getElementById('username').value.trim();
    const key = document.getElementById('key').value.trim();
    const keySignature = document.getElementById('time').value.trim();
    const outputContent = document.getElementById('inputTextArea').innerHTML;

    const state = {
        title: name,
        key: key,
        timeSignature: keySignature,
        content: outputContent,
        accidentalPreference, // Save sharp/flat state
        modePreference,       // Save notes/chords state
        semitones             // Save transposition value
    };

    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const fileName = `${name}-${key}-${keySignature}.json`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}


    

function importState(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const state = JSON.parse(e.target.result);

        // Restore input fields
        document.getElementById('username').value = state.title || '';
        document.getElementById('key').value = state.key || '';
        document.getElementById('time').value = state.timeSignature || '';
        inputTextArea.innerHTML = state.content || '';


        // Update originalText with loaded content
        originalText = state.content || '';
        
        // Call functions to treat the loaded content as manual input
        handleInputChange(); 
        updateTransposition();

        // Restore button states
        accidentalPreference = state.accidentalPreference || 'sharp';
        modePreference = state.modePreference || 'notes';
      

        // Restore UI states for buttons and sliders
        document.querySelector(`input[name="accidental"][value="${accidentalPreference}"]`).checked = true;
        document.querySelector(`input[name="mode"][value="${modePreference}"]`).checked = true;
        semitoneValue.value = semitones;

        // Call functions to treat the restored state as manually entered input
        setInitialSelected(); // Updates button styles
        updateTransposition(); // Applies transposition and formatting
        handleInputChange(); // Updates `originalText` for future transpositions
    };
    reader.readAsText(file);
}



    function updateTransposition() {
        let currentText = transposeText(originalText, semitones);
        currentText = applyAccidentalPreference(currentText);
        inputTextArea.innerHTML = formatText(currentText);
        placeCaretAtEnd(inputTextArea); // Move caret after formatting
    }

    function placeCaretAtEnd(el) {
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    function handleTransposeClick(direction) {
        if (direction === 'minus') {
            if (semitones > -12) {
                semitones--;
                semitoneValue.value = semitones;
                updateTransposition();
            }
        } else if (direction === 'plus') {
            if (semitones < 12) {
                semitones++;
                semitoneValue.value = semitones;
                updateTransposition();
            }
        }
    }

    function reset() {
        semitones = 0;
        semitoneValue.value = 0;
        inputTextArea.innerHTML = originalText;
        updateTransposition();
    }

    function handleInputChange() {
        if (semitones === 0) {
            originalText = inputTextArea.innerText;
        } else {
            const currentText = inputTextArea.innerText;
            originalText = transposeText(currentText, -semitones);
        }
    }

    saveBtn.addEventListener('click', saveAndExport);
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', importState);

    printBtn.addEventListener('click', printOutput);

    transposeMinus.addEventListener('click', () => handleTransposeClick('minus'));
    transposePlus.addEventListener('click', () => handleTransposeClick('plus'));
    resetButton.addEventListener('click', reset);

    accidentals.forEach(radio => {
        radio.addEventListener('change', () => {
            accidentalPreference = document.querySelector('input[name="accidental"]:checked').value;
            updateTransposition();
        });
    });

    modes.forEach(radio => {
        radio.addEventListener('change', () => {
            modePreference = document.querySelector('input[name="mode"]:checked').value;
            updateTransposition();
        });
    });

    inputTextArea.addEventListener('input', handleInputChange);


    // Function to set initial selected button on page load
function setInitialSelected() {
    // Update accidental buttons
    const accidentalRadios = document.querySelectorAll('.radio-button-group input[name="accidental"]');
    accidentalRadios.forEach(radio => {
        radio.parentElement.classList.toggle('selected', radio.checked);
    });

    // Update mode buttons
    const modeRadios = document.querySelectorAll('.radio-button-group input[name="mode"]');
    modeRadios.forEach(radio => {
        radio.parentElement.classList.toggle('selected', radio.checked);
    });
}


    // Highlight the selected button when changed
    const accidentalRadios = document.querySelectorAll('.radio-button-group input[name="accidental"]');
    accidentalRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            accidentalRadios.forEach(r => r.parentElement.classList.remove('selected'));
            this.parentElement.classList.add('selected');
        });
    });

    const modeRadios = document.querySelectorAll('.radio-button-group input[name="mode"]');
    modeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            modeRadios.forEach(r => r.parentElement.classList.remove('selected'));
            this.parentElement.classList.add('selected');
        });
    });

    // Call the function on page load to highlight default selections
    setInitialSelected();






document.getElementById('inputTextArea').addEventListener('keypress', function(event) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    
    // Make sure the new text is inserted outside of superscript tags
    if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
        const parentElement = range.startContainer.parentNode;
        if (parentElement.tagName.toLowerCase() === 'sup' || parentElement.tagName.toLowerCase() === 'sub') {
            event.preventDefault();
            // Move caret to the end of the parent element
            range.setStartAfter(parentElement);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
});


document.getElementById('inputTextArea').addEventListener('keypress', function(event) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    // Check if the caret is inside a superscript or subscript element
    if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
        const parentElement = range.startContainer.parentNode;
        if (parentElement.tagName.toLowerCase() === 'sup' || parentElement.tagName.toLowerCase() === 'sub') {
            event.preventDefault(); // Prevent typing in superscript/subscript

            // Move caret to end of superscript/subscript element
            range.setStartAfter(parentElement);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
});
    
    
    
    
    // Call updateTransposition on page load to apply default colors
window.onload = () => {
    originalText = inputTextArea.innerText; // Capture original text
    updateTransposition(); // Apply default transposition of 0
};

// Modify updateTransposition to apply formatting even when semitones = 0
function updateTransposition() {
    // Always apply a transposition of semitones, even if it's 0
    let currentText = transposeText(originalText, semitones);
    
    // Apply accidental preference (sharp/flat)
    currentText = applyAccidentalPreference(currentText);
    
    // Format text with colors for notes and chords
    inputTextArea.innerHTML = formatText(currentText);
    
    // Ensure the caret stays at the end after formatting
    placeCaretAtEnd(inputTextArea);
}





function insertTextAtCaret(text) {
    const textArea = document.getElementById('inputTextArea');
    textArea.focus();
    
    const sel = window.getSelection();
    const range = sel.getRangeAt(0);
    
    // Check and move caret if it's inside superscript or subscript
    if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
        const element = range.startContainer.parentElement;
        if (element.tagName.toLowerCase() === 'sup' || element.tagName.toLowerCase() === 'sub') {
            range.setStartAfter(element);
            range.collapse(true);
        }
    }
    
    // Insert the text
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    
    // Move caret to end of inserted text
    range.setStartAfter(range.endContainer);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
}


     document.getElementById('inputTextArea').addEventListener('keydown', function(event) {
            // Prevent default behavior if necessary
        });

        document.getElementById('inputTextArea').addEventListener('keyup', function(event) {
            const sel = window.getSelection();
            const range = sel.getRangeAt(0);
            const node = range.startContainer;

            // Check if the cursor is within a superscript or subscript
            if (node.nodeType === Node.ELEMENT_NODE) {
                const parent = node.closest('.sup, .sub');
                if (parent) {
                    // Move cursor to the end of the text node
                    const newRange = document.createRange();
                    newRange.setStartAfter(parent);
                    newRange.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(newRange);
                }
            }
        });

        document.getElementById('inputTextArea').addEventListener('click', function(event) {
            const sel = window.getSelection();
            const range = sel.getRangeAt(0);
            const node = range.startContainer;

            // Check if the cursor is within a superscript or subscript
            if (node.nodeType === Node.ELEMENT_NODE) {
                const parent = node.closest('.sup, .sub');
                if (parent) {
                    // Move cursor to the end of the text node
                    const newRange = document.createRange();
                    newRange.setStartAfter(parent);
                    newRange.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(newRange);
                }
            }
        });

</script>
