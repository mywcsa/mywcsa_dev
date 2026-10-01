"use client";

import { useState } from "react";

type Role = "staff" | "business-partner" | "external-user" | "member";

type LoginSectionProps = {
  role: Role;
  title: string;
  href: string;
  video: string;
  activeRole: Role | null;
  onInfoClick: (role: Role) => void;
};

export default function Home() {
  const [activeRole, setActiveRole] = useState<Role | null>(null);

  function handleInfoClick(role: Role) {
    /*
      If the same information button is clicked again,
      close the video and return to the normal login screen.
    */
    if (activeRole === role) {
      setActiveRole(null);
      return;
    }

    /*
      Otherwise open the selected role's tutorial.
      The other two login sections will automatically disappear.
    */
    setActiveRole(role);
  }

  return (
    <main className="govapps-login">
      <section className="login-box">

        {/* =========================================
            MyWCSA GovApps Logo
           ========================================= */}
        <div className="login-logo">
          <img
            src="/mywcsa-logo.png"
            alt="MyWCSA GovApps"
          />
        </div>


        {/* =========================================
            STAFF

            Staff tutorial:
            /public/videos/staff-login.mp4
           ========================================= */}
        {(activeRole === null || activeRole === "staff") && (
          <LoginSection
            role="staff"
            title="Staff"
            href="/login/staff"
            video="/videos/staff-login.mp4"
            activeRole={activeRole}
            onInfoClick={handleInfoClick}
          />
        )}


        {/* =========================================
            BUSINESS PARTNER

            Business Partner tutorial:
            /public/videos/business-partartner-login.mp4
           ========================================= */}
        {(activeRole === null || activeRole === "business-partner") && (
          <LoginSection
            role="business-partner"
            title="Business Partner"
            href="/login/business-partner"
            video="/videos/business-partner-login.mp4"
            activeRole={activeRole}
            onInfoClick={handleInfoClick}
          />
        )}


        {/* =========================================
            EXTERNAL USER

            External User tutorial:
            /public/videos/external-user-login.mp4
           ========================================= */}
        {(activeRole === null || activeRole === "external-user") && (
          <LoginSection
            role="external-user"
            title="External User"
            href="/login/external-user"
            video="/videos/external-user-login.mp4"
            activeRole={activeRole}
            onInfoClick={handleInfoClick}
          />
        )}


        {/* =========================================
            MEMBER

            WCSA Member login portal.

            Tutorial:
            /public/videos/member-login.mp4
           ========================================= */}
        {(activeRole === null || activeRole === "member") && (
          <LoginSection
            role="member"
            title="Member"
            href="/login/member"
            video="/videos/member-login.mp4"
            activeRole={activeRole}
            onInfoClick={handleInfoClick}
          />
        )}

      </section>
    </main>
  );
}


/* =====================================================
   LOGIN SECTION COMPONENT

   This component is used for:
   - Staff
   - Business Partner
   - External User
   ===================================================== */

function LoginSection({
  role,
  title,
  href,
  video,
  activeRole,
  onInfoClick,
}: LoginSectionProps) {

  const isVideoOpen = activeRole === role;

  return (
    <div
      className={`login-section ${
        isVideoOpen ? "login-section-video-open" : ""
      }`}
    >

      {/* =========================================
          ROLE TITLE
         ========================================= */}
      <div className="login-title-row">

        <span className="login-title">
          {title}
        </span>


        {/* =========================================
            INFORMATION BUTTON

            Click once:
            - Opens this role's tutorial
            - Hides the other roles

            Click again:
            - Closes tutorial
            - Restores all three roles
           ========================================= */}
        <button
          type="button"
          className={`info-icon ${
            isVideoOpen ? "info-icon-active" : ""
          }`}
          aria-label={
            isVideoOpen
              ? `Close ${title} login tutorial`
              : `Watch ${title} login tutorial`
          }
          title={
            isVideoOpen
              ? "Close tutorial"
              : `Watch ${title} login tutorial`
          }
          onClick={() => onInfoClick(role)}
        >
          i
        </button>

      </div>


      {/* =========================================
          NORMAL LOGIN VIEW

          When the information video is NOT open,
          show the normal Login button.
         ========================================= */}
      {!isVideoOpen && (
        <div className="login-button-area">

          <a
            href={href}
            className="login-button"
          >
            Login
          </a>

        </div>
      )}


      {/* =========================================
          VIDEO INFORMATION VIEW

          When the information button is clicked,
          the Login button is replaced by the
          role-specific tutorial video.
         ========================================= */}
      {isVideoOpen && (
        <div className="login-video-area">

          <video
            className="login-video"
            controls
            autoPlay
            playsInline
            preload="metadata"
            key={video}
          >
            <source
              src={video}
              type="video/mp4"
            />

            Your browser does not support HTML5 video.
          </video>

        </div>
      )}

    </div>
  );
}