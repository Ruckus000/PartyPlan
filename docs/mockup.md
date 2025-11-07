<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>EDC Squad Sync</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --bg-primary: #000000;
            --bg-secondary: #0a0a0a;
            --bg-card: #141414;
            --bg-hover: #1a1a1a;

            --text-primary: #ffffff;
            --text-secondary: #a0a0a0;
            --text-muted: #606060;

            --accent-blue: #3b82f6;
            --accent-green: #10b981;
            --accent-yellow: #f59e0b;
            --accent-red: #ef4444;
            --accent-purple: #8b5cf6;

            --border: rgba(255, 255, 255, 0.08);
            --border-strong: rgba(255, 255, 255, 0.16);

            --status-online: #10b981;
            --status-busy: #f59e0b;
            --status-offline: #6b7280;
            --status-lost: #ef4444;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            overscroll-behavior: none;
            -webkit-font-smoothing: antialiased;
        }

        .app-container {
            max-width: 430px;
            margin: 0 auto;
            min-height: 100vh;
            background: var(--bg-secondary);
            position: relative;
            display: flex;
            flex-direction: column;
        }

        /* View Tabs */
        .view-tabs {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            background: var(--bg-primary);
            border-bottom: 1px solid var(--border);
            position: sticky;
            top: 0;
            z-index: 50;
        }

        .view-tab {
            padding: 14px;
            text-align: center;
            font-size: 13px;
            font-weight: 500;
            color: var(--text-muted);
            background: transparent;
            border: none;
            cursor: pointer;
            position: relative;
            transition: all 0.2s;
        }

        .view-tab:hover {
            color: var(--text-secondary);
        }

        .view-tab.active {
            color: var(--text-primary);
        }

        .view-tab.active::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 20%;
            right: 20%;
            height: 2px;
            background: var(--accent-blue);
        }

        /* Main Content */
        .main-content {
            flex: 1;
            overflow-y: auto;
        }

        /* Timeline View */
        .timeline-view {
            padding: 16px;
        }

        .time-block {
            margin-bottom: 24px;
        }

        .time-header {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            position: sticky;
            top: 0;
            background: var(--bg-secondary);
            padding: 8px 0;
            z-index: 10;
        }

        .time-label {
            font-size: 24px;
            font-weight: 600;
            margin-right: 12px;
            min-width: 80px;
        }

        .time-meta {
            font-size: 12px;
            color: var(--text-muted);
        }

        .squad-timeline {
            display: flex;
            gap: 2px;
            position: relative;
            padding-left: 92px;
        }

        .timeline-lane {
            flex: 1;
            min-height: 60px;
            background: var(--bg-card);
            border-radius: 8px;
            padding: 8px;
            position: relative;
            transition: all 0.2s;
        }

        .timeline-lane:hover {
            background: var(--bg-hover);
        }

        .stage-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-muted);
            margin-bottom: 6px;
        }

        .artist-pill {
            background: var(--accent-blue);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            display: inline-block;
            margin: 2px;
        }

        .artist-pill.friend {
            background: var(--accent-green);
        }

        .artist-pill.conflict {
            background: var(--accent-red);
        }

        .artist-pill.maybe {
            background: var(--accent-yellow);
        }

        /* Squad Status Cards */
        .squad-view {
            padding: 16px;
        }

        .squad-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }

        .squad-card {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 16px;
            border: 1px solid var(--border);
            transition: all 0.2s;
        }

        .squad-card:hover {
            border-color: var(--border-strong);
            transform: translateY(-2px);
        }

        .squad-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
        }

        .squad-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
            position: relative;
        }

        .squad-status-dot {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid var(--bg-card);
        }

        .status-online .squad-status-dot {
            background: var(--status-online);
        }

        .status-busy .squad-status-dot {
            background: var(--status-busy);
        }

        .status-offline .squad-status-dot {
            background: var(--status-offline);
        }

        .status-lost .squad-status-dot {
            background: var(--status-lost);
        }

        .squad-info {
            flex: 1;
            margin-left: 12px;
        }

        .squad-name {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 2px;
        }

        .squad-location {
            font-size: 11px;
            color: var(--text-secondary);
        }

        /* Edit Profile Button */
        .edit-profile-btn {
            width: 100%;
            padding: 12px;
            border-radius: 8px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            color: var(--text-primary);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .edit-profile-btn:hover {
            background: var(--bg-hover);
            border-color: var(--border-strong);
        }

        /* Meeting Points */
        .meeting-point {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 12px;
            padding: 16px;
            margin: 16px;
            text-align: center;
        }

        .meeting-time {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--accent-blue);
        }

        .meeting-location {
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 12px;
        }

        .meeting-attendees {
            display: flex;
            justify-content: center;
            gap: 8px;
        }

        .mini-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid var(--bg-card);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: 600;
            margin-left: -8px;
        }

        /* Offline Banner */
        .offline-banner {
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid rgba(245, 158, 11, 0.3);
            padding: 12px;
            margin: 16px;
            border-radius: 8px;
            text-align: center;
            font-size: 12px;
            color: var(--accent-yellow);
        }

        /* Floating Action Button */
        .fab {
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: var(--accent-blue);
            color: white;
            border: none;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            z-index: 100;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        @media (min-width: 430px) {
            .fab {
                left: calc((100vw - 430px) / 2 + 20px);
            }
        }

        .fab:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
        }

        .fab:active {
            transform: scale(0.95);
        }

        /* Modal Overlay */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 200;
            animation: fadeIn 0.2s;
        }

        .modal-overlay.active {
            display: block;
        }

        .modal-content {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            max-width: 430px;
            margin: 0 auto;
            background: var(--bg-secondary);
            border-radius: 16px 16px 0 0;
            padding: 20px;
            animation: slideUp 0.3s;
            max-height: 80vh;
            overflow-y: auto;
        }

        .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
        }

        .modal-title {
            font-size: 18px;
            font-weight: 600;
        }

        .close-btn {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--bg-card);
            border: 1px solid var(--border);
            color: var(--text-secondary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .close-btn:hover {
            background: var(--bg-hover);
            color: var(--text-primary);
        }

        .modal-tabs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 20px;
        }

        .modal-tab {
            padding: 10px;
            border-radius: 8px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            color: var(--text-secondary);
            cursor: pointer;
            font-size: 14px;
            text-align: center;
            transition: all 0.2s;
        }

        .modal-tab.active {
            background: var(--accent-blue);
            color: white;
            border-color: var(--accent-blue);
        }

        .time-select, .stage-select {
            width: 100%;
            padding: 10px;
            border-radius: 8px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            color: var(--text-primary);
            margin-bottom: 12px;
            font-size: 14px;
        }

        .artist-search {
            width: 100%;
            padding: 10px;
            border-radius: 8px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            color: var(--text-primary);
            margin-bottom: 12px;
            font-size: 14px;
        }

        .artist-list-modal {
            max-height: 200px;
            overflow-y: auto;
            margin-bottom: 12px;
        }

        .artist-item {
            padding: 10px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 8px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .artist-item:hover {
            background: var(--bg-hover);
            border-color: var(--border-strong);
        }

        .artist-item.selected {
            background: rgba(59, 130, 246, 0.2);
            border-color: var(--accent-blue);
        }

        .add-button {
            width: 100%;
            padding: 12px;
            border-radius: 8px;
            background: var(--accent-blue);
            color: white;
            border: none;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .add-button:hover {
            background: #2563eb;
        }

        .add-button:disabled {
            background: var(--bg-card);
            color: var(--text-muted);
            cursor: not-allowed;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }

        /* Loading States */
        .skeleton {
            background: linear-gradient(90deg, var(--bg-card) 0%, var(--bg-hover) 50%, var(--bg-card) 100%);
            background-size: 200% 100%;
            animation: skeleton-loading 1.5s infinite;
            border-radius: 8px;
            height: 60px;
            margin-bottom: 12px;
        }

        @keyframes skeleton-loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    </style>

</head>
<body>
    <div class="app-container">
        <!-- View Tabs -->
        <div class="view-tabs">
            <button class="view-tab active" onclick="switchView('timeline')">Timeline</button>
            <button class="view-tab" onclick="switchView('squad')">Squad Status</button>
            <button class="view-tab" onclick="switchView('map')">Map</button>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Timeline View -->
            <div id="timeline-view" class="timeline-view">
                <!-- Meeting Point -->
                <div class="meeting-point">
                    <div class="meeting-time">10:00 PM</div>
                    <div class="meeting-location">Water Station - Circuit Grounds</div>
                    <div class="meeting-attendees">
                        <div class="mini-avatar" style="background: var(--accent-blue);">ME</div>
                        <div class="mini-avatar" style="background: var(--accent-green);">SC</div>
                        <div class="mini-avatar" style="background: var(--accent-purple);">JM</div>
                        <div class="mini-avatar" style="background: var(--accent-yellow);">MR</div>
                        <div class="mini-avatar" style="background: var(--status-offline);">+3</div>
                    </div>
                </div>

                <!-- 9:00 PM Block -->
                <div class="time-block">
                    <div class="time-header">
                        <div class="time-label">9:00 PM</div>
                        <div class="time-meta">NOW • Squad splitting</div>
                    </div>
                    <div class="squad-timeline">
                        <div class="timeline-lane">
                            <div class="stage-label">Kinetic Field</div>
                            <div class="artist-pill">Chris Lake</div>
                            <div class="artist-pill friend">SC, JM</div>
                        </div>
                        <div class="timeline-lane">
                            <div class="stage-label">Circuit Grounds</div>
                            <div class="artist-pill conflict">Porter Robinson</div>
                            <div class="artist-pill">ME, AL</div>
                        </div>
                        <div class="timeline-lane">
                            <div class="stage-label">Neon Garden</div>
                            <div class="artist-pill friend">MR, TK</div>
                        </div>
                        <div class="timeline-lane">
                            <div class="stage-label">Quantum Valley</div>
                            <div style="color: var(--text-muted); font-size: 11px; padding: 8px;">Empty</div>
                        </div>
                    </div>
                </div>

                <!-- 10:00 PM Block -->
                <div class="time-block">
                    <div class="time-header">
                        <div class="time-label">10:00 PM</div>
                        <div class="time-meta">Meeting point scheduled</div>
                    </div>
                    <div class="squad-timeline">
                        <div class="timeline-lane">
                            <div class="stage-label">Kinetic Field</div>
                            <div class="artist-pill maybe">Tiësto</div>
                            <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Undecided</div>
                        </div>
                        <div class="timeline-lane">
                            <div class="stage-label">Circuit Grounds</div>
                            <div class="artist-pill">Virtual Riot</div>
                            <div class="artist-pill">Full squad?</div>
                        </div>
                        <div class="timeline-lane">
                            <div class="stage-label">Neon Garden</div>
                            <div style="color: var(--text-muted); font-size: 11px; padding: 8px;">Empty</div>
                        </div>
                        <div class="timeline-lane">
                            <div class="stage-label">Quantum Valley</div>
                            <div style="color: var(--text-muted); font-size: 11px; padding: 8px;">Empty</div>
                        </div>
                    </div>
                </div>

                <!-- 11:00 PM Block -->
                <div class="time-block">
                    <div class="time-header">
                        <div class="time-label">11:00 PM</div>
                        <div class="time-meta">Major conflict</div>
                    </div>
                    <div class="squad-timeline">
                        <div class="timeline-lane">
                            <div class="stage-label">Kinetic Field</div>
                            <div class="artist-pill conflict">Zedd</div>
                            <div class="artist-pill">4 going</div>
                        </div>
                        <div class="timeline-lane">
                            <div class="stage-label">Circuit Grounds</div>
                            <div class="artist-pill conflict">Excision</div>
                            <div class="artist-pill">3 going</div>
                        </div>
                        <div class="timeline-lane">
                            <div class="stage-label">Neon Garden</div>
                            <div style="color: var(--text-muted); font-size: 11px; padding: 8px;">Empty</div>
                        </div>
                        <div class="timeline-lane">
                            <div class="stage-label">Quantum Valley</div>
                            <div style="color: var(--text-muted); font-size: 11px; padding: 8px;">Empty</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Squad Status View -->
            <div id="squad-view" class="squad-view" style="display: none;">
                <div style="padding: 0 16px; margin-bottom: 16px;">
                    <div style="font-size: 12px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">Current Time: 9:15 PM</div>
                </div>

                <div class="squad-grid">
                    <!-- You Card -->
                    <div class="squad-card">
                        <div class="squad-header">
                            <div class="squad-avatar status-online" style="background: var(--accent-blue);">
                                ME
                                <div class="squad-status-dot"></div>
                            </div>
                            <div class="squad-info">
                                <div class="squad-name">You</div>
                                <div class="squad-location">Porter Robinson</div>
                            </div>
                        </div>
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border);">
                            <div style="font-size: 10px; color: var(--text-muted); margin-bottom: 4px;">NOW PLAYING</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Circuit Grounds • 9:00-10:00 PM</div>
                        </div>
                    </div>

                    <!-- Friend Cards -->
                    <div class="squad-card">
                        <div class="squad-header">
                            <div class="squad-avatar status-busy" style="background: var(--accent-green);">
                                SC
                                <div class="squad-status-dot"></div>
                            </div>
                            <div class="squad-info">
                                <div class="squad-name">Sarah Chen</div>
                                <div class="squad-location">Chris Lake</div>
                            </div>
                        </div>
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border);">
                            <div style="font-size: 10px; color: var(--text-muted); margin-bottom: 4px;">NOW PLAYING</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Kinetic Field • 9:00-10:00 PM</div>
                        </div>
                    </div>

                    <div class="squad-card">
                        <div class="squad-header">
                            <div class="squad-avatar status-offline" style="background: var(--accent-purple);">
                                JM
                                <div class="squad-status-dot"></div>
                            </div>
                            <div class="squad-info">
                                <div class="squad-name">Jake Miller</div>
                                <div class="squad-location">Chris Lake</div>
                            </div>
                        </div>
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border);">
                            <div style="font-size: 10px; color: var(--text-muted); margin-bottom: 4px;">NOW PLAYING</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Kinetic Field • 9:00-10:00 PM</div>
                        </div>
                    </div>

                    <div class="squad-card">
                        <div class="squad-header">
                            <div class="squad-avatar status-lost" style="background: var(--accent-yellow);">
                                MR
                                <div class="squad-status-dot"></div>
                            </div>
                            <div class="squad-info">
                                <div class="squad-name">Mike Rodriguez</div>
                                <div class="squad-location">No schedule</div>
                            </div>
                        </div>
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border);">
                            <div style="font-size: 10px; color: var(--text-muted); margin-bottom: 4px;">NEXT UP</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Meeting Point • 10:00 PM</div>
                        </div>
                    </div>

                    <div class="squad-card">
                        <div class="squad-header">
                            <div class="squad-avatar status-online" style="background: var(--accent-red);">
                                AL
                                <div class="squad-status-dot"></div>
                            </div>
                            <div class="squad-info">
                                <div class="squad-name">Alex Lee</div>
                                <div class="squad-location">Porter Robinson</div>
                            </div>
                        </div>
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border);">
                            <div style="font-size: 10px; color: var(--text-muted); margin-bottom: 4px;">NOW PLAYING</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Circuit Grounds • 9:00-10:00 PM</div>
                        </div>
                    </div>

                    <div class="squad-card">
                        <div class="squad-header">
                            <div class="squad-avatar status-offline" style="background: var(--status-offline);">
                                TK
                                <div class="squad-status-dot"></div>
                            </div>
                            <div class="squad-info">
                                <div class="squad-name">Taylor Kim</div>
                                <div class="squad-location">Break</div>
                            </div>
                        </div>
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border);">
                            <div style="font-size: 10px; color: var(--text-muted); margin-bottom: 4px;">NEXT UP</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Virtual Riot • 10:00 PM</div>
                        </div>
                    </div>
                </div>

                <!-- Edit Profile Button -->
                <div style="padding: 20px 16px 40px;">
                    <button class="edit-profile-btn" onclick="openEditProfile()">
                        <svg style="width: 16px; height: 16px; margin-right: 8px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit Profile
                    </button>
                </div>
            </div>

            <!-- Map View -->
            <div id="map-view" class="conflicts-view" style="display: none;">
                <!-- Venue Map Container -->
                <div style="padding: 16px;">
                    <div style="background: var(--bg-card); border-radius: 12px; padding: 16px; border: 1px solid var(--border);">
                        <!-- Simple ASCII-style venue map -->
                        <div style="font-family: monospace; font-size: 11px; line-height: 1.4; color: var(--text-secondary); overflow-x: auto;">
                            <pre style="margin: 0;">
    ┌─────────────────────────────────────┐
    │          🎪 KINETIC FIELD           │
    │         (Main Stage)                │
    │     [Water Station] [Merch]         │
    └────────────┬───────────────────────┘
                 │
    ┌────────────┴───────────┐
    │     ENTRANCE/EXIT      │
    └────────────────────────┘
                 │
       ┌─────────┴─────────┐
       │                   │

┌──────▼──────┐ ┌──────▼──────┐
│ 🎸 │ │ 🎹 │
│ CIRCUIT │ │ QUANTUM │
│ GROUNDS │ │ VALLEY │
│ │ │ │
│ [Bathrooms] │ │ [Medical] │
└─────────────┘ └──────────────┘
│ │
└─────────┬─────────┘
│
┌───────▼────────┐
│ 🌙 NEON │
│ GARDEN │
│ │
│ [Food Court] │
└────────────────┘
</pre>
</div>
</div>
</div>

                <!-- Meeting Points -->
                <div style="padding: 0 16px;">
                    <div class="section-title" style="margin: 16px 0 12px; font-size: 12px; text-transform: uppercase; color: var(--text-muted);">Pre-set Meeting Points</div>

                    <div class="meeting-point" style="margin-bottom: 12px;">
                        <div class="meeting-time">If Lost</div>
                        <div class="meeting-location">🚩 Main Water Station - Kinetic Field</div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">
                            Check every 30 minutes on the hour
                        </div>
                    </div>

                    <div class="meeting-point" style="margin-bottom: 12px;">
                        <div class="meeting-time">Emergency</div>
                        <div class="meeting-location">🏥 Medical Tent - Quantum Valley</div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">
                            Staff can help locate friends
                        </div>
                    </div>

                    <div class="meeting-point">
                        <div class="meeting-time">End of Night</div>
                        <div class="meeting-location">🚪 Main Entrance/Exit</div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">
                            2:00 AM or 30 min after last set
                        </div>
                    </div>
                </div>

                <!-- Stage Distances -->
                <div style="padding: 16px;">
                    <div class="section-title" style="margin-bottom: 12px; font-size: 12px; text-transform: uppercase; color: var(--text-muted);">Walking Times Between Stages</div>
                    <div style="background: var(--bg-card); border-radius: 8px; padding: 12px; border: 1px solid var(--border);">
                        <div style="display: grid; gap: 8px; font-size: 12px;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Kinetic → Circuit</span>
                                <span>~5 min</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Kinetic → Quantum</span>
                                <span>~7 min</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Circuit → Neon</span>
                                <span>~8 min</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Quantum → Neon</span>
                                <span>~6 min</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Any → Entrance</span>
                                <span>~10-15 min</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Floating Action Button -->
        <button class="fab" onclick="openAddModal()">+</button>

        <!-- Add Modal -->
        <div id="add-modal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">Add to Schedule</div>
                    <button class="close-btn" onclick="closeAddModal()">×</button>
                </div>

                <div class="modal-tabs">
                    <div class="modal-tab active" onclick="switchModalTab('artist')">Artist</div>
                    <div class="modal-tab" onclick="switchModalTab('meetup')">Meeting Point</div>
                </div>

                <!-- Artist Tab Content -->
                <div id="artist-tab-content">
                    <input type="text" class="artist-search" placeholder="Search artists..." id="artist-search" onkeyup="searchArtists()">

                    <div class="artist-list-modal" id="artist-list">
                        <div class="artist-item" onclick="selectArtist(this, 'Porter Robinson', '9:00 PM', 'Circuit Grounds')">
                            <div style="font-weight: 500;">Porter Robinson</div>
                            <div style="font-size: 12px; color: var(--text-muted);">9:00 PM • Circuit Grounds</div>
                        </div>
                        <div class="artist-item" onclick="selectArtist(this, 'Chris Lake', '9:00 PM', 'Kinetic Field')">
                            <div style="font-weight: 500;">Chris Lake</div>
                            <div style="font-size: 12px; color: var(--text-muted);">9:00 PM • Kinetic Field</div>
                        </div>
                        <div class="artist-item" onclick="selectArtist(this, 'Virtual Riot', '10:00 PM', 'Circuit Grounds')">
                            <div style="font-weight: 500;">Virtual Riot</div>
                            <div style="font-size: 12px; color: var(--text-muted);">10:00 PM • Circuit Grounds</div>
                        </div>
                        <div class="artist-item" onclick="selectArtist(this, 'Zedd', '11:00 PM', 'Kinetic Field')">
                            <div style="font-weight: 500;">Zedd</div>
                            <div style="font-size: 12px; color: var(--text-muted);">11:00 PM • Kinetic Field</div>
                        </div>
                        <div class="artist-item" onclick="selectArtist(this, 'Excision', '11:00 PM', 'Circuit Grounds')">
                            <div style="font-weight: 500;">Excision</div>
                            <div style="font-size: 12px; color: var(--text-muted);">11:00 PM • Circuit Grounds</div>
                        </div>
                        <div class="artist-item" onclick="selectArtist(this, 'Adam Beyer', '12:00 AM', 'Neon Garden')">
                            <div style="font-weight: 500;">Adam Beyer</div>
                            <div style="font-size: 12px; color: var(--text-muted);">12:00 AM • Neon Garden</div>
                        </div>
                    </div>

                    <button class="add-button" id="add-artist-btn" disabled onclick="addArtistToSchedule()">Select an Artist</button>
                </div>

                <!-- Meetup Tab Content -->
                <div id="meetup-tab-content" style="display: none;">
                    <select class="time-select" id="meetup-time">
                        <option value="">Select Time</option>
                        <option value="8:00 PM">8:00 PM</option>
                        <option value="8:30 PM">8:30 PM</option>
                        <option value="9:00 PM">9:00 PM</option>
                        <option value="9:30 PM">9:30 PM</option>
                        <option value="10:00 PM">10:00 PM</option>
                        <option value="10:30 PM">10:30 PM</option>
                        <option value="11:00 PM">11:00 PM</option>
                        <option value="11:30 PM">11:30 PM</option>
                        <option value="12:00 AM">12:00 AM</option>
                        <option value="12:30 AM">12:30 AM</option>
                        <option value="1:00 AM">1:00 AM</option>
                        <option value="1:30 AM">1:30 AM</option>
                        <option value="2:00 AM">2:00 AM</option>
                    </select>

                    <select class="stage-select" id="meetup-location">
                        <option value="">Select Location</option>
                        <option value="Kinetic Field - Water Station">Kinetic Field - Water Station</option>
                        <option value="Circuit Grounds - Entrance">Circuit Grounds - Entrance</option>
                        <option value="Neon Garden - Food Court">Neon Garden - Food Court</option>
                        <option value="Quantum Valley - Medical Tent">Quantum Valley - Medical Tent</option>
                        <option value="Main Entrance">Main Entrance</option>
                        <option value="Pixel Forest Art">Pixel Forest Art Installation</option>
                    </select>

                    <button class="add-button" onclick="addMeetupToSchedule()">Add Meeting Point</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        let selectedArtist = null;

        function switchView(view) {
            // Hide all views
            document.getElementById('timeline-view').style.display = 'none';
            document.getElementById('squad-view').style.display = 'none';
            document.getElementById('map-view').style.display = 'none';

            // Show selected view
            document.getElementById(view + '-view').style.display = 'block';

            // Update tab states
            document.querySelectorAll('.view-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            event.target.classList.add('active');
        }

        function openAddModal() {
            document.getElementById('add-modal').classList.add('active');
        }

        function closeAddModal() {
            document.getElementById('add-modal').classList.remove('active');
            // Reset modal state
            selectedArtist = null;
            document.querySelectorAll('.artist-item').forEach(item => {
                item.classList.remove('selected');
            });
            document.getElementById('add-artist-btn').disabled = true;
            document.getElementById('add-artist-btn').textContent = 'Select an Artist';
        }

        function switchModalTab(tab) {
            document.querySelectorAll('.modal-tab').forEach(t => {
                t.classList.remove('active');
            });
            event.target.classList.add('active');

            if (tab === 'artist') {
                document.getElementById('artist-tab-content').style.display = 'block';
                document.getElementById('meetup-tab-content').style.display = 'none';
            } else {
                document.getElementById('artist-tab-content').style.display = 'none';
                document.getElementById('meetup-tab-content').style.display = 'block';
            }
        }

        function selectArtist(element, name, time, stage) {
            // Remove previous selection
            document.querySelectorAll('.artist-item').forEach(item => {
                item.classList.remove('selected');
            });

            // Add selection to clicked item
            element.classList.add('selected');

            // Store selected artist info
            selectedArtist = { name, time, stage };

            // Enable add button
            document.getElementById('add-artist-btn').disabled = false;
            document.getElementById('add-artist-btn').textContent = `Add ${name}`;
        }

        function searchArtists() {
            const searchTerm = document.getElementById('artist-search').value.toLowerCase();
            const artistItems = document.querySelectorAll('.artist-item');

            artistItems.forEach(item => {
                const artistName = item.querySelector('div').textContent.toLowerCase();
                if (artistName.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        }

        function addArtistToSchedule() {
            if (selectedArtist) {
                console.log('Adding artist to schedule:', selectedArtist);
                // In a real app, this would update the schedule data
                alert(`Added ${selectedArtist.name} at ${selectedArtist.time} to your schedule!`);
                closeAddModal();
            }
        }

        function addMeetupToSchedule() {
            const time = document.getElementById('meetup-time').value;
            const location = document.getElementById('meetup-location').value;

            if (time && location) {
                console.log('Adding meetup:', { time, location });
                // In a real app, this would update the schedule data
                alert(`Added meeting point at ${location} at ${time}!`);
                closeAddModal();
            } else {
                alert('Please select both time and location');
            }
        }

        function openEditProfile() {
            // In a real app, this would open a profile editing interface
            alert('Edit Profile feature - this would let you update your schedule and status');
            // You could reuse the add modal here with different content
        }

        // Close modal when clicking outside
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('add-modal').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeAddModal();
                }
            });
        });
    </script>

</body>
</html>