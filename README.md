# 🌿 AgriLens: Precision Agricultural Decision Support

AgriLens is a sophisticated decision support system (DSS) designed to empower farmers and agricultural experts with data-driven insights. Utilizing the **Simple Additive Weighting (SAW)** algorithm, AgriLens synthesizes complex criteria into actionable rankings, ensuring optimal decision-making for crop selection, soil management, and resource allocation.

---

## ✨ Key Features

- **SAW Intelligence Engine**: High-performance implementation of the Simple Additive Weighting algorithm for multi-criteria decision analysis.
- **Neo-Modern Dashboard**: A premium, "Bento-grid" inspired user interface designed for clarity and visual excellence.
- **Dynamic Parameter Weighting**: Real-time adjustment of criteria weights with live comparative matrix updates.
- **AI-Powered Assistance**: Integrated helper widgets (AgriLens AI) to guide users through complex parameter configurations.
- **Responsive & High Fidelity**: Fully responsive design system built with Tailwind CSS, ensuring a seamless experience across all devices.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 (Glassmorphism & Neo-Modern aesthetics)
- **State Management**: React Context + Hooks
- **Logic**: Custom SAW Algorithm implementation (TypeScript)
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- NPM or PNPM

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AKAL30ftr/Agrilenss-SAW-Simple-Additive-Weighting-.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   Create a `.env.local` file based on `.env.example` if you plan to use AI features.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📐 Architecture

AgriLens follows a modular architectural pattern:

- **`lib/saw/engine.ts`**: The core SAW logic responsible for normalization and preference value calculation.
- **`components/`**: Atomic and molecular UI components adhering to the AgriLens design system.
- **`hooks/useSAW.tsx`**: State container providing the decision matrix and ranking logic to the entire app.

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">
  <p>Built with precision for the future of agriculture.</p>
</div>
