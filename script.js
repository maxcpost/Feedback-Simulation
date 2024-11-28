/*
 * Audio Feedback Management Game
 * This application simulates speaker and microphone placement in a venue setting,
 * helping users understand audio feedback principles and proper equipment positioning.
 * 
 * Features:
 * - Interactive drag-and-drop placement of speakers and microphones
 * - Multiple microphone pattern types (cardioid, supercardioid, etc.)
 * - Real-time visualization of audio coverage and potential feedback zones
 * - Volume and rotation controls for speakers
 * - Feedback detection and warning system
 */

// Ensure the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Speaker and Microphone Placement Game
    placementGame();
});

// Function for Speaker and Microphone Placement Game
function placementGame() {
    const canvas = document.getElementById('venue-canvas');
    const ctx = canvas.getContext('2d');

    const micTypeSelect = document.getElementById('mic-type-select');
    const micAngleSlider = document.getElementById('mic-angle');
    const speakerVolumeSlider = document.getElementById('speaker-volume');
    const addSpeakerBtn = document.getElementById('add-speaker-btn');
    const removeSpeakerBtn = document.getElementById('remove-speaker-btn');
    const submitBtn = document.getElementById('placement-submit');
    const feedback = document.getElementById('placement-feedback');
    const speakerControlsContainer = document.getElementById('speaker-controls-container');

    // Initial positions for microphone
    let micPosition = { x: 400, y: 500 };
    let micAngle = parseInt(micAngleSlider.value); // In degrees

    // Initial settings
    let micType = micTypeSelect.value;
    let speakerVolume = parseInt(speakerVolumeSlider.value);

    // Load icons
    const speakerIcon = new Image();
    speakerIcon.src = 'images/speaker-icon.png'; // Provide this image

    const micIcon = new Image();
    micIcon.src = 'images/mic-icon.png'; // Provide this image

    // List of speakers
    let speakers = [
        { x: 200, y: 150, angle: 0, id: 0 }
    ];
    const maxSpeakers = 5;

    // Variables to track dragging
    let dragging = false;
    let dragTarget = null;
    let offsetX, offsetY;

    // Event listeners
    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('mousemove', drag);
    canvas.addEventListener('mouseup', endDrag);
    canvas.addEventListener('mouseout', endDrag);

    micTypeSelect.addEventListener('change', () => {
        micType = micTypeSelect.value;
        drawScene();
    });

    micAngleSlider.addEventListener('input', () => {
        micAngle = parseInt(micAngleSlider.value);
        drawScene();
    });

    speakerVolumeSlider.addEventListener('input', () => {
        speakerVolume = parseInt(speakerVolumeSlider.value);
        drawScene();
    });

    addSpeakerBtn.addEventListener('click', addSpeaker);
    removeSpeakerBtn.addEventListener('click', removeSpeaker);

    submitBtn.addEventListener('click', checkSetup);

    // Functions for dragging
    function startDrag(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isInside(x, y, micPosition)) {
            dragging = true;
            dragTarget = 'mic';
            offsetX = x - micPosition.x;
            offsetY = y - micPosition.y;
        } else {
            for (let i = 0; i < speakers.length; i++) {
                if (isInside(x, y, speakers[i])) {
                    dragging = true;
                    dragTarget = speakers[i];
                    offsetX = x - speakers[i].x;
                    offsetY = y - speakers[i].y;
                    break;
                }
            }
        }
    }

    function drag(e) {
        if (dragging) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left - offsetX;
            const y = e.clientY - rect.top - offsetY;

            if (dragTarget === 'mic') {
                micPosition.x = x;
                micPosition.y = y;
            } else {
                dragTarget.x = x;
                dragTarget.y = y;
            }
            drawScene();
        }
    }

    function endDrag() {
        dragging = false;
        dragTarget = null;
    }

    function isInside(x, y, position) {
        const dx = x - position.x;
        const dy = y - position.y;
        return dx * dx + dy * dy < 400; // Icon radius of 20px
    }

    // Add and remove speakers
    function addSpeaker() {
        if (speakers.length < maxSpeakers) {
            const newSpeaker = {
                x: 100 + speakers.length * 100,
                y: 150,
                angle: 0,
                id: speakers.length
            };
            speakers.push(newSpeaker);
            addSpeakerControl(newSpeaker);
            drawScene();
        }
    }

    function removeSpeaker() {
        if (speakers.length > 1) {
            const removedSpeaker = speakers.pop();
            removeSpeakerControl(removedSpeaker.id);
            drawScene();
        }
    }

    // Add individual speaker rotation control
    function addSpeakerControl(speaker) {
        const controlDiv = document.createElement('div');
        controlDiv.className = 'speaker-control';
        controlDiv.id = `speaker-control-${speaker.id}`;

        const label = document.createElement('label');
        label.textContent = `Speaker ${speaker.id + 1} Rotation:`;

        const rotationInput = document.createElement('input');
        rotationInput.type = 'range';
        rotationInput.min = '0';
        rotationInput.max = '360';
        rotationInput.value = '0';
        rotationInput.addEventListener('input', (e) => {
            speaker.angle = parseInt(e.target.value);
            drawScene();
        });

        controlDiv.appendChild(label);
        controlDiv.appendChild(rotationInput);
        speakerControlsContainer.appendChild(controlDiv);
    }

    // Remove speaker control
    function removeSpeakerControl(speakerId) {
        const controlDiv = document.getElementById(`speaker-control-${speakerId}`);
        if (controlDiv) {
            speakerControlsContainer.removeChild(controlDiv);
        }
    }

    // Initialize speaker controls
    speakers.forEach((speaker) => {
        addSpeakerControl(speaker);
    });

    // Drawing functions
    function drawScene() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // First, draw the overlap indicator (will show red areas)
        drawOverlapIndicator();

        // Then draw the speaker and mic patterns on top with transparency
        speakers.forEach((speaker, index) => {
            drawSpeakerPattern(speaker, index);
        });

        drawMicPattern();

        // Finally draw the icons
        speakers.forEach((speaker) => {
            ctx.save();
            ctx.translate(speaker.x, speaker.y);
            ctx.rotate((speaker.angle * Math.PI) / 180);
            ctx.rotate(-Math.PI / 2);
            ctx.drawImage(speakerIcon, -20, -20, 40, 40);
            ctx.restore();
        });

        ctx.save();
        ctx.translate(micPosition.x, micPosition.y);
        ctx.rotate((micAngle * Math.PI) / 180);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(micIcon, -20, -20, 40, 40);
        ctx.restore();
    }

    function drawSpeakerPattern(speaker, index) {
        // Directional Pattern
        const speakerRadius = speakerVolume * 5;
        const speakerAngle = Math.PI / 4; // Changed from PI/6 to PI/4 (45 degrees beamwidth)

        ctx.save();
        ctx.translate(speaker.x, speaker.y);
        ctx.rotate((speaker.angle * Math.PI) / 180);

        // Draw directional pattern in green
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, speakerRadius, -speakerAngle, speakerAngle);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'; // Green with transparency
        ctx.fill();

        ctx.restore();
    }

    function drawMicPattern() {
        const maxRadius = 80;
        const scale = 1 + speakerVolume / 100;

        ctx.save();
        ctx.translate(micPosition.x, micPosition.y);
        ctx.rotate((micAngle * Math.PI) / 180);

        ctx.beginPath();

        if (micType === 'cardioid') {
            for (let angle = 0; angle <= 360; angle++) {
                const rad = (angle * Math.PI) / 180;
                const r = maxRadius * (1 + Math.cos(rad)) / 2 * scale;
                const x = r * Math.cos(rad);
                const y = r * Math.sin(rad);
                angle === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
        } else if (micType === 'supercardioid') {
            for (let angle = 0; angle <= 360; angle++) {
                const rad = (angle * Math.PI) / 180;
                const r = maxRadius * (0.59 + 0.41 * Math.cos(rad)) * scale;
                const x = r * Math.cos(rad);
                const y = r * Math.sin(rad);
                angle === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
        } else if (micType === 'hypercardioid') {
            for (let angle = 0; angle <= 360; angle++) {
                const rad = (angle * Math.PI) / 180;
                const r = maxRadius * (0.25 + 0.75 * Math.cos(rad)) * scale;
                const x = r * Math.cos(rad);
                const y = r * Math.sin(rad);
                angle === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
        } else if (micType === 'omnidirectional') {
            ctx.arc(0, 0, maxRadius * scale, 0, 2 * Math.PI);
        }

        ctx.closePath();
        ctx.fillStyle = 'rgba(135, 206, 235, 0.3)'; // Light blue (skyblue) with transparency
        ctx.fill();

        ctx.restore();
    }

    function drawOverlapIndicator() {
        // Create an off-screen canvas
        const offCanvas = document.createElement('canvas');
        offCanvas.width = canvas.width;
        offCanvas.height = canvas.height;
        const offCtx = offCanvas.getContext('2d');

        // First layer: Draw speaker patterns in pure green
        speakers.forEach((speaker) => {
            const speakerRadius = speakerVolume * 5;
            const speakerAngle = Math.PI / 4;

            offCtx.save();
            offCtx.translate(speaker.x, speaker.y);
            offCtx.rotate((speaker.angle * Math.PI) / 180);

            offCtx.beginPath();
            offCtx.moveTo(0, 0);
            offCtx.arc(0, 0, speakerRadius, -speakerAngle, speakerAngle);
            offCtx.closePath();
            offCtx.fillStyle = '#00FF00';  // Pure green
            offCtx.fill();

            offCtx.restore();
        });

        // Second layer: Draw mic pattern in pure blue with 'source-in' compositing
        offCtx.save();
        offCtx.globalCompositeOperation = 'source-in';
        
        offCtx.translate(micPosition.x, micPosition.y);
        offCtx.rotate((micAngle * Math.PI) / 180);
        
        offCtx.fillStyle = '#0000FF';  // Pure blue
        offCtx.beginPath();
        
        const maxRadius = 80;
        const scale = 1 + speakerVolume / 100;

        if (micType === 'cardioid') {
            for (let angle = 0; angle <= 360; angle++) {
                const rad = (angle * Math.PI) / 180;
                const r = maxRadius * (1 + Math.cos(rad)) / 2 * scale;
                const x = r * Math.cos(rad);
                const y = r * Math.sin(rad);
                angle === 0 ? offCtx.moveTo(x, y) : offCtx.lineTo(x, y);
            }
        } else if (micType === 'omnidirectional') {
            offCtx.arc(0, 0, maxRadius * scale, 0, 2 * Math.PI);
        }
        
        offCtx.closePath();
        offCtx.fill();
        offCtx.restore();

        // Get the overlapping areas
        const imageData = offCtx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convert overlapping areas to red
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) {  // If there's any opacity (meaning overlap)
                data[i] = 255;      // Red
                data[i + 1] = 0;    // Green
                data[i + 2] = 0;    // Blue
                data[i + 3] = 255;  // Full opacity
            }
        }

        // Draw the red overlap areas
        ctx.putImageData(imageData, 0, 0);
    }

    function checkOverlap() {
        // Create an off-screen canvas
        const offCanvas = document.createElement('canvas');
        offCanvas.width = canvas.width;
        offCanvas.height = canvas.height;
        const offCtx = offCanvas.getContext('2d');

        // Draw speaker patterns in green
        speakers.forEach((speaker) => {
            const speakerRadius = speakerVolume * 5;
            const speakerAngle = Math.PI / 4;

            offCtx.save();
            offCtx.translate(speaker.x, speaker.y);
            offCtx.rotate((speaker.angle * Math.PI) / 180);

            offCtx.beginPath();
            offCtx.moveTo(0, 0);
            offCtx.arc(0, 0, speakerRadius, -speakerAngle, speakerAngle);
            offCtx.closePath();
            offCtx.fillStyle = '#00FF00';  // Pure green
            offCtx.fill();

            offCtx.restore();
        });

        // Draw mic pattern in blue with 'source-in' compositing
        offCtx.save();
        offCtx.globalCompositeOperation = 'source-in';
        
        offCtx.translate(micPosition.x, micPosition.y);
        offCtx.rotate((micAngle * Math.PI) / 180);
        
        offCtx.fillStyle = '#0000FF';
        offCtx.beginPath();
        
        const maxRadius = 80;
        const scale = 1 + speakerVolume / 100;

        if (micType === 'cardioid') {
            for (let angle = 0; angle <= 360; angle++) {
                const rad = (angle * Math.PI) / 180;
                const r = maxRadius * (1 + Math.cos(rad)) / 2 * scale;
                const x = r * Math.cos(rad);
                const y = r * Math.sin(rad);
                angle === 0 ? offCtx.moveTo(x, y) : offCtx.lineTo(x, y);
            }
        } else if (micType === 'omnidirectional') {
            offCtx.arc(0, 0, maxRadius * scale, 0, 2 * Math.PI);
        }
        
        offCtx.closePath();
        offCtx.fill();
        offCtx.restore();

        // Check if there are any overlapping pixels
        const imageData = offCtx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // If any pixel has opacity, there's an overlap
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) {  // If there's any opacity
                return true;  // Overlap found
            }
        }

        return false;  // No overlap found
    }

    function checkSetup() {
        // Check for potential feedback using the new overlap detection
        const feedbackPossible = checkOverlap();

        if (feedbackPossible) {
            feedback.textContent = 'Feedback is likely. Adjust your setup to minimize overlap.';
            feedback.style.color = 'red';
            playFeedbackSound();
        } else {
            feedback.textContent = 'Great setup! Feedback is minimized.';
            feedback.style.color = 'green';
        }
    }

    // Feedback Sound Simulation
    const feedbackSound = new Audio('audio/feedback.mp3'); // Provide this audio file

    function playFeedbackSound() {
        feedbackSound.currentTime = 0;
        feedbackSound.play();
    }

    // Load icons and draw the initial scene once icons are loaded
    let iconsLoaded = 0;
    speakerIcon.onload = () => {
        iconsLoaded++;
        if (iconsLoaded === 2) {
            drawScene();
        }
    };
    micIcon.onload = () => {
        iconsLoaded++;
        if (iconsLoaded === 2) {
            drawScene();
        }
    };
}
