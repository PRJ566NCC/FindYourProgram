"use client";

import { useRouter } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();

  const cards = [
    {
      key: "bug",
      title: "Report Bug",
      description: "Something not working as expected?",
      onClick: () => router.push("/contact/report-bug"),
      disabled: false,
    },
    {
      key: "payment",
      title: "Payment Issue",
      description: "Trouble with a donation or charge?",
      onClick: () => router.push("/contact/payment-issue"),
      disabled: false,
    },
    {
      key: "wrong-info",
      title: "Wrong Information",
      description: "Coming soon",
      disabled: true,
    },
    {
      key: "personal-info",
      title: "Personal Information",
      description: "Coming soon",
      disabled: true,
    },
    {
      key: "refunds",
      title: "Refunds",
      description: "Request a refund or ask about a charge.",
      onClick: () => router.push("/contact/refund"),
      disabled: false,
    },
    {
      key: "partnership",
      title: "Partnership",
      description: "Interested in sponsorship or collaboration?",
      onClick: () => router.push("/contact/partnership"),
      disabled:false,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F4EBE2",
        padding: "40px 0 60px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <div style={{ marginBottom: "24px", fontSize: "0.9rem", color: "#6b6b6b" }}>
          Home / Contact Us
        </div>

        <h1
          style={{
            fontSize: "2.3rem",
            margin: 0,
            marginBottom: "10px",
            fontWeight: 700,
          }}
        >
          Contact Us
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "18px",
            marginTop: "24px",
            marginBottom: "40px",
            padding: "18px 22px",
            backgroundColor: "#F5E5D0",
            borderRadius: "10px",
            border: "1px solid #d9c9b2",
          }}
        >
          <div>
            <div style={{ fontSize: "0.9rem", color: "#666" }}>Phone</div>
            <div style={{ fontWeight: 600 }}>(416) 356-9980</div>
          </div>
          <div>
            <div style={{ fontSize: "0.9rem", color: "#666" }}>Address</div>
            <div style={{ fontWeight: 600 }}>
              37 Bloor St. Toronto, ON. M2P9H0
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.9rem", color: "#666" }}>Email</div>
            <div style={{ fontWeight: 600 }}>findyourprogram@gmail.com</div>
          </div>
        </div>

        <h2
          style={{
            fontSize: "1.7rem",
            marginBottom: "8px",
            fontWeight: 600,
          }}
        >
          Get the info you&apos;re looking for right now
        </h2>

        <p style={{ marginTop: 0, marginBottom: "28px", color: "#555" }}>
          Choose a topic so we can route your request to the right team.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "20px",
          }}
        >
          {cards.map((card) => (
            <button
              key={card.key}
              onClick={!card.disabled ? card.onClick : undefined}
              disabled={card.disabled}
              style={{
                textAlign: "left",
                padding: "18px 20px",
                borderRadius: "12px",
                border: "1px solid #d3c2aa",
                backgroundColor: card.disabled ? "#f6f0e7" : "#fff7e7",
                cursor: card.disabled ? "not-allowed" : "pointer",
                boxShadow: card.disabled
                  ? "none"
                  : "0 2px 6px rgba(0,0,0,0.06)",
                transition: "transform 0.1s ease, box-shadow 0.1s ease",
              }}
              onMouseEnter={(e) => {
                if (!card.disabled) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 10px rgba(0,0,0,0.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (!card.disabled) {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow =
                    "0 2px 6px rgba(0,0,0,0.06)";
                }
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: "6px",
                  fontSize: "1.05rem",
                }}
              >
                {card.title}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: card.disabled ? "#9c8f7c" : "#6b6050",
                }}
              >
                {card.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
