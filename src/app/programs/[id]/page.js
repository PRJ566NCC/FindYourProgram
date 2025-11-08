"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "@/app/globals.module.css";
import FavoriteButton from "@/components/FavoriteButton";


export default function ProgramDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/programs/${encodeURIComponent(id)}`, {
          cache: "no-store"
        });

        if (!res.ok) {
          throw new Error("Program not found");
        }

        const data = await res.json();
        setProgram(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.background}>
        <div className={styles.registerContainer}>
          <h2>Loading program details...</h2>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className={styles.background}>
        <div className={styles.registerContainer}>
          <h2>Program Not Found</h2>
          <p style={{ color: 'red' }}>{error || "Could not find the requested program."}</p>
          <button onClick={() => router.push("/search")} className={styles.registerBtn}>
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFA07A 0%, #FFB6C1 50%, #DDA0DD 100%)'
    }}>
      <div style={{
        background: '#FFB6C1',
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: '#333'
          }}
        >
          ← Back to search results
        </button>
      </div>

      <div style={{
        background: '#FFB6C1',
        padding: '20px 40px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: 0,
            marginBottom: '8px'
          }}>
            {program.programName}
          </h1>
          <p style={{
            fontSize: '1.2rem',
            margin: 0,
            color: '#333'
          }}>
            {program.universityName}
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
         {/* 
        <button style={{
          padding: '10px 24px',
          background: 'white',
          border: '2px solid #333',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          Favorite ♡
        </button>
        */}
         <FavoriteButton programId={program.programId || decodeURIComponent(id)} />
          <button style={{
            padding: '10px 24px',
            background: 'white',
            border: '2px solid #333',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            Rate ⭐
          </button>
          <button style={{
            padding: '10px 24px',
            background: 'white',
            border: '2px solid #333',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            PDF ⬇
          </button>
        </div>
      </div>

      <div style={{
        display: 'flex',
        padding: '40px',
        gap: '40px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{
          flex: '0 0 400px'
        }}>
          <div style={{
            background: program.universityColor || '#0055A4',
            color: 'white',
            padding: '60px 40px',
            borderRadius: '8px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '150px',
              height: '150px',
              background: program.universityAccentColor || '#FFD700',
              borderBottomLeftRadius: '100%'
            }}></div>
            
            {/*if logo exists */}
            {program.universityLogoUrl && !logoError ? (
              <img
                src={program.universityLogoUrl}
                alt={program.universityName}
                style={{
                  maxWidth: '90%',
                  maxHeight: '250px',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  position: 'relative',
                  zIndex: 1
                }}
                onError={() => setLogoError(true)}
              />
            ) : (
              <h2 style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                lineHeight: '1.2',
                margin: 0,
                position: 'relative',
                zIndex: 1,
                textAlign: 'center'
              }}>
                {program.universityName?.split(' ').slice(0, 2).join(' ')}
                <br />
                {program.universityName?.split(' ').slice(2).join(' ')}
              </h2>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            background: '#E8E8E8',
            padding: '30px',
            borderRadius: '8px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '30px'
          }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Length of study</h3>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>{program.lengthOfStudy || 'N/A'}</p>
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Co-op availability</h3>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>{program.coopAvailability || 'N/A'}</p>
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Program Level</h3>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>{program.degreeType || 'N/A'}</p>
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Remote learning</h3>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>{program.remoteLearning || 'N/A'}</p>
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Language</h3>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>{program.language || 'English'}</p>
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Area of Study</h3>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>{program.areaOfStudy || 'N/A'}</p>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            {program.websiteLink ? (
              <a
                href={program.websiteLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '14px 40px',
                  background: '#000',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '25px',
                  fontSize: '1rem',
                }}
              >
                Official Website link
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}