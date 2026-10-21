:root {
    --bg: #011430;
    --white: #ffffff;
    --clock: #00ccff;
    --seconds: #FF7C80;
    --grey: #BCBDBD;
    --header-text: #000080;
    --logo-size: 240px;
    --clock-size: 90px;
    --date-size: 26px;
    --table-width: 90%;
    --cell-size: 20px;
    --button-size: 32px;
}

body {
    margin: 0;
    padding: 10px;
    background: var(--bg);
    color: var(--white);
    font-family: Tahoma, sans-serif;
    text-align: center;
    overflow: hidden;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.container {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    transition: transform 0.1s ease-out;
}

.header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 30px;
    padding: 5px;
    margin-bottom: 10px;
}

.logo {
    width: var(--logo-size);
    height: auto;
    object-fit: contain;
}

.title-section {
    text-align: center;
}

.time {
    color: var(--clock);
    font-size: var(--clock-size);
    font-weight: bold;
    line-height: 1.1;
    margin: 2px 0;
}

.seconds {
    color: var(--seconds);
    font-size: 0.6em;
}

.date {
    margin-top: 2px;
    color: #cccccc;
    font-size: var(--date-size);
}

.venue-selector-wrap {
    margin-top: 6px;
}

.venue-select {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    border: 2px solid var(--clock);
    font-size: 22px;
    font-weight: bold;
    border-radius: 6px;
    padding: 4px 12px;
    text-align: center;
    text-align-last: center;
    cursor: pointer;
    outline: none;
}

.venue-select option {
    background: var(--bg);
    color: #fff;
}

table {
    width: var(--table-width);
    margin: 0 auto;
    border-collapse: collapse;
}

th {
    padding: 10px 8px;
    background: var(--grey);
    color: var(--header-text);
    font-size: clamp(14px, 1.5vw, 22px);
    font-weight: bold;
    border: 1px solid var(--bg);
}

.main-title-header {
    font-size: clamp(18px, 2vw, 28px);
    letter-spacing: 1px;
}

.meta-row td {
    background: rgba(255, 255, 255, 0.05);
    padding: 6px;
    border: 1px solid var(--grey);
}

.meta-control {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
}

.meta-label {
    font-size: 18px;
    font-weight: bold;
    color: var(--clock);
}

.inline-select {
    background: var(--bg);
    color: var(--white);
    border: 1px solid var(--clock);
    border-radius: 4px;
    padding: 4px 12px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    outline: none;
    width: auto;
}

.phase-toggle {
    display: inline-flex;
    gap: 8px;
}

.phase-btn {
    padding: 4px 14px;
    font-size: 16px;
    font-weight: bold;
    border: 1px solid var(--grey);
    background: transparent;
    color: var(--white);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.phase-btn.active {
    background: var(--clock);
    color: var(--bg);
    border-color: var(--clock);
}

td {
    padding: 8px 6px;
    border: 1px solid var(--grey);
    color: var(--white);
    font-size: var(--cell-size);
    font-weight: bold;
    text-align: center;
}

td:first-child, th.subject-th {
    width: 28%;
    min-width: 240px;
}

select, input[type="text"], input[type="number"] {
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 4px 6px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    background: var(--bg);
    color: var(--white);
    font-family: Tahoma, sans-serif;
    font-size: var(--cell-size);
    font-weight: bold;
    text-align: center;
    text-align-last: center;
}

select:focus, input:focus {
    border-color: var(--clock);
    outline: none;
}

.action-cell {
    width: 80px;
    white-space: nowrap;
}

.action-btn-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.row-btn {
    width: var(--button-size);
    height: var(--button-size);
    padding: 0;
    border: 1px solid transparent;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    font-size: 18px;
    font-weight: bold;
    line-height: 1;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
}

.add-btn {
    color: #00ff66;
    border-color: #00ff66;
}

.add-btn:hover {
    background: #00ff66;
    color: var(--bg);
}

.delete-btn {
    color: #ff4d4d;
    border-color: #ff4d4d;
}

.delete-btn:hover {
    background: #ff4d4d;
    color: var(--bg);
}

.delete-btn.hidden {
    display: none !important;
}

.fullscreen-btn {
    position: fixed;
    right: 15px;
    bottom: 15px;
    padding: 6px 12px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.5);
    color: var(--white);
    font-family: Tahoma, sans-serif;
    font-size: 11px;
    font-weight: bold;
    cursor: pointer;
    z-index: 1000;
}

.fullscreen-btn:hover {
    background: var(--clock);
    border-color: var(--clock);
    color: var(--bg);
}
