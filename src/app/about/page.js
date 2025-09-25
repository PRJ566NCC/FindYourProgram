"use client";
import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="about">
      <section className="header">
        <h1>About Us</h1>
      </section>

      <section className="content">
        <div className="text">
          <p>
            <em>Find Your Program</em> is a student-built platform designed to help
            learners discover academic programs that truly align with their
            goals and passions. Our mission is to make exploring programs, both
            local and international, easy, guided, and personalized.
          </p>
          <p>
            We are <strong>Team Binary Brains</strong>, a group of Seneca Polytechnic
            students collaborating to bring this vision to life:
          </p>
          <ul>
            <li>
              <strong>Ifaz Hassan</strong> - Team Lead & Systems Architect
            </li>
            <li>
              <strong>Farbod Moayeri</strong> - Product Owner & Business Analyst
            </li>
            <li>
              <strong>Steven Hur</strong> - Lead Front-End Developer
            </li>
            <li>
              <strong>Xuesong Zhou (Tommy)</strong> - Back-End & Database Engineer
            </li>
            <li>
              <strong>Rong Chen (Elisa)</strong> - Quality Assurance Engineer
            </li>
          </ul>
          <p className="closing">
            We believe choosing your educational path should not be stressful. It
            should feel like a clear journey, thoughtfully designed, supportive,
            and tailored to every student’s future.
          </p>
        </div>

        <div className="logoWrap">
          <Image
            src="/FindYourProgramLogo.png"
            alt="Find Your Program logo"
            width={300}
            height={300}
            priority
            className="logo"
          />
        </div>
      </section>

      <style jsx>{`
        .about {
          width: 100vw;
          height: 100vh;
          margin: 0;
          padding: 2.5rem 3rem;
          background: var(--fyp-bg, #e7dfd7);
          color: var(--fyp-fg, #1e1e1e);
          font-size: 1.15rem;
          line-height: 1.7;
          box-sizing: border-box;
          overflow: hidden;
        }
        .header {
          border-bottom: 2px solid rgba(0,0,0,0.15);
          margin-bottom: 1.5rem;
        }
        h1 {
          margin: 0 0 1.25rem 0;
          font-size: 2.25rem;
          line-height: 1.3;
          letter-spacing: 0.5px;
        }
        .content {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
          height: calc(100% - 6rem);
        }
        .text {
          flex: 1 1 60%;
          overflow-y: auto;
        }
        .text p {
          margin: 0 0 1rem 0;
        }
        .text ul { 
          margin: 0.5rem 0 1rem 1.25rem; 
          padding-left: 1rem; 
        }
        .text li { 
          margin: 0.4rem 0; 
        }
        .closing {
          font-weight: 600;
          font-size: 1.2rem;
        }
        .logoWrap {
          flex: 0 0 35%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .logo {
          height: auto;
          width: 100%;
          max-width: 300px;
        }
      `}</style>
    </main>
  );
}