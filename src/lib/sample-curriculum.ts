// Static sample used to power the prototype before the real DB is seeded.
// Mirrors the design's data shape.

import type { WeekModule } from "@/components/RoadmapTopo";

export type SampleCurriculum = {
  id: string;
  title: string;
  subtitle: string;
  days: number;
  startedAt: string;
  currentDay: number;
  currentPhase: "theory" | "practical" | "quiz";
  streak: number;
  notesCount: number;
  quizAvg: number;
  hoursLogged: number;
  modules: WeekModule[];
};

export const SAMPLE_CURRICULUM: SampleCurriculum = {
  id: "anti-jam-rf",
  title: "Anti-Jam RF & SDR",
  subtitle: "From dB to adaptive nulling — a 28-day field manual",
  days: 28,
  startedAt: "Mar 14",
  currentDay: 9,
  currentPhase: "practical",
  streak: 6,
  notesCount: 23,
  quizAvg: 84,
  hoursLogged: 14.5,
  modules: [
    {
      week: 1,
      title: "Foundations",
      days: [
        { n: 1, title: "Spectrum, dB, dBm", status: "done" },
        { n: 2, title: "Time vs. frequency domain", status: "done" },
        { n: 3, title: "FFT intuition", status: "done" },
        { n: 4, title: "Noise floor & SNR", status: "done" },
        { n: 5, title: "Modulation basics", status: "done" },
        { n: 6, title: "IQ sampling", status: "done" },
        { n: 7, title: "Week 1 review", status: "done" },
      ],
    },
    {
      week: 2,
      title: "SDR Hands-on",
      days: [
        { n: 8, title: "HackRF / RTL-SDR setup", status: "done" },
        { n: 9, title: "Capturing a live signal", status: "current" },
        { n: 10, title: "GNU Radio flowgraphs", status: "queued" },
        { n: 11, title: "Filter design", status: "queued" },
        { n: 12, title: "Decoding FM / AM", status: "queued" },
        { n: 13, title: "Direction finding 101", status: "queued" },
        { n: 14, title: "Week 2 review", status: "queued" },
      ],
    },
    {
      week: 3,
      title: "Jamming & Detection",
      days: [
        { n: 15, title: "Jammer taxonomy", status: "queued" },
        { n: 16, title: "Barrage vs. spot jamming", status: "queued" },
        { n: 17, title: "Sweep jammers", status: "queued" },
        { n: 18, title: "Reactive jammers", status: "queued" },
        { n: 19, title: "Detecting interference", status: "queued" },
        { n: 20, title: "Geolocating sources", status: "queued" },
        { n: 21, title: "Week 3 review", status: "queued" },
      ],
    },
    {
      week: 4,
      title: "Counter-jam",
      days: [
        { n: 22, title: "Frequency hopping", status: "queued" },
        { n: 23, title: "DSSS & spread spectrum", status: "queued" },
        { n: 24, title: "Adaptive notch filtering", status: "queued" },
        { n: 25, title: "Beamforming", status: "queued" },
        { n: 26, title: "Adaptive nulling", status: "queued" },
        { n: 27, title: "Field exercise", status: "queued" },
        { n: 28, title: "Capstone", status: "queued" },
      ],
    },
  ],
};

export const OTHER_TRAILS = [
  { id: "rust", title: "Rust from scratch", day: 4, total: 21, accent: "#7A5AE0" },
  { id: "music", title: "Modal harmony", day: 11, total: 14, accent: "#B47A2B" },
  { id: "kalman", title: "Kalman filters", day: 2, total: 10, accent: "#3F7D8C" },
];

export type TranscriptMessage =
  | { role: "system"; kind: "phase-marker"; phase: string; label: string; status: "done" | "current" | "queued" }
  | { role: "tutor"; body: string }
  | { role: "user"; body: string }
  | { role: "tool"; tool: string; label: string };

export const TRANSCRIPT: TranscriptMessage[] = [
  { role: "system", kind: "phase-marker", phase: "theory", label: "Theory", status: "done" },
  {
    role: "tutor",
    body: `Yesterday you flashed the HackRF and got a clean spectrum sweep. Today we **capture** — turning live RF into a file you can analyze offline.

Three concepts to lock in before we touch hardware:

1. **Sample rate vs. bandwidth.** The HackRF samples up to 20 MS/s complex. Nyquist says you see ±10 MHz around the tuned center.
2. **IQ files are interleaved.** \`cs8\` = signed 8-bit I, then Q, then I, then Q… A 10-second capture at 10 MS/s is 200 MB. Plan storage.
3. **Gain staging.** LNA → VGA → ADC. Too low and you bury the signal in quantization; too high and you clip. We'll watch the histogram.`,
  },
  { role: "tool", tool: "save_note", label: 'Note saved · "IQ file = interleaved I,Q,I,Q… cs8 means signed int8"' },
  {
    role: "user",
    body: `Why complex sampling and not just real? I get why you'd sample at 2× the highest frequency but the IQ thing still feels like magic.`,
  },
  {
    role: "tutor",
    body: `Good question — this trips everyone up.

Real sampling at \`2·f_max\` works for **baseband**: signals from 0 Hz up to f_max. For a radio centered at 100 MHz with 1 MHz of width, real sampling would need 200+ MS/s. Wasteful.

IQ sampling shifts the signal down to 0 Hz **before** sampling, splitting it into in-phase (I) and quadrature (Q) — a 90°-shifted copy. Now you only need 2 × *bandwidth*, not 2 × *frequency*. The Q channel is what lets you tell positive frequencies from negative, which a real signal can't.

Think of it as: real sampling sees a wheel spinning and can't tell which way; IQ sees a wheel with a stripe on it.`,
  },
  { role: "user", body: `That last analogy actually landed. Saving it.` },
  { role: "tool", tool: "save_note", label: 'Note saved · "IQ vs real: real sees the wheel, IQ sees the stripe"' },
  { role: "tool", tool: "mark_phase_complete", label: "Theory phase complete · moving to Practical" },
  { role: "system", kind: "phase-marker", phase: "practical", label: "Practical", status: "current" },
  {
    role: "tutor",
    body: `**Exercise 9.1 — Capture FM broadcast band.**

Plug in the HackRF. Pick any strong local FM station (88–108 MHz). Run:

\`\`\`bash
hackrf_transfer -r fm_capture.cs8 \\
    -f 100300000 -s 2000000 \\
    -l 16 -g 20 -n 20000000
\`\`\`

That's 10 seconds at 2 MS/s centered on 100.3 MHz. Open it in inspectrum or GNU Radio. Tell me:

- What does the waterfall look like?
- Can you see the stereo pilot at ±19 kHz from center?
- Does the histogram of I values look gaussian, or are you clipping?`,
  },
];

export type BuilderDraft = {
  topic: string;
  goal: string;
  weeks: number;
  modules: { week: number; title: string; days: string[] }[];
};

export const BUILDER_DRAFT: BuilderDraft = {
  topic: "Kalman filters for drone navigation",
  goal: "Implement a working 6-DOF EKF in Python by week 3",
  weeks: 3,
  modules: [
    {
      week: 1,
      title: "Linear foundations",
      days: [
        "Probability refresher — Gaussians, covariance",
        "State-space models",
        "The 1D Kalman filter, by hand",
        "Discrete vs. continuous time",
        "Matrix Kalman: predict / update",
      ],
    },
    {
      week: 2,
      title: "Nonlinear & practical",
      days: [
        "Why linear breaks for drones",
        "Extended Kalman Filter (EKF)",
        "Unscented Kalman Filter",
        "Sensor fusion: IMU + GPS",
        "Tuning Q and R matrices",
      ],
    },
    {
      week: 3,
      title: "Build it",
      days: [
        "Python scaffold + simulation",
        "6-DOF state vector design",
        "EKF implementation",
        "Flight log replay",
        "Capstone: log-driven trajectory recovery",
      ],
    },
  ],
};
