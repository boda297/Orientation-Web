# Orientation App

**Orientation App** is a comprehensive full-stack web application designed to streamline the student orientation process[cite: 1]. Developed using **Next.js** and **TypeScript**, the platform provides a centralized hub for discovering academic areas, managing projects, and connecting developers with upcoming student orientations[cite: 1]. It features a robust dashboard for administrative oversight and personalized user experiences for students and developers[cite: 1].

## 2. Features
The application provides a variety of interactive modules for users and administrators:
*   **Authentication System**: Secure user registration, login, password recovery, and email verification[cite: 1].
*   **Dynamic Dashboards**: Specialized management views for handling users, developer profiles, and orientation projects[cite: 1].
*   **Area Exploration**: Interactive discovery of different academic or professional areas through dedicated pages[cite: 1].
*   **Project Tracking**: Real-time listing of trending, upcoming, and saved orientation projects[cite: 1].
*   **Interactive UI Components**: Includes a Chat Widget for support, a Sidebar for navigation, and a "Top 10" showcase for featured orientations[cite: 1].
*   **Responsive Media**: Integrated assets for logos and project previews to ensure a visual-first orientation experience[cite: 1].

## 3. The Process
The development followed a modern web architecture to ensure scalability and performance:
1.  **Framework Selection**: Utilized **Next.js** for server-side rendering and efficient routing[cite: 1].
2.  **Styling**: Implemented **Tailwind CSS** via PostCSS for a responsive and modular design[cite: 1].
3.  **State & Data Management**: Built custom library functions (`lib/api.ts`, `lib/auth.ts`) to handle asynchronous requests and secure session management[cite: 1].
4.  **Component Architecture**: Developed reusable UI components (Hero, Header, Footer, Sidebar) to maintain consistency across the frontend[cite: 1].
5.  **Quality Assurance**: Configured **ESLint** for code linting and **TypeScript** for strict type checking to minimize runtime errors[cite: 1].

## 4. Running the Project
To set up and run the orientation web application locally, follow these steps:

### Prerequisites
*   Node.js (Latest LTS version recommended)
*   npm or yarn

### Installation
1.  **Clone the repository**:
    ```bash
    git clone [repository-url]
    cd Orientation-Web
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Development Mode**:
    Launch the development server:
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.
4.  **Build for Production**:
    ```bash
    npm run build
    npm start
    ```

## 5. License
This project and all associated video content are proprietary.

© 2026 FBM Team. All Rights Reserved.

All videos and shows on this platform are trademarks of, and all related images and content are the property of, Aziz Film. Duplication and copying of this material is strictly prohibited. Unauthorised reproduction, distribution, or modification of any part of this codebase or its content — in whole or in part — is not permitted without explicit written consent from FBM Team.

```
