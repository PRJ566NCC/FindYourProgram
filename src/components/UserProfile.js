"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "@/app/globals.module.css";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function UserProfile() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [wantsPwdChange, setWantsPwdChange] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState("");

  const [showExportMenu, setShowExportMenu] = useState(false);

  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const res = await fetch("/api/profile", {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load profile");
        if (!off) {
          setForm({
            username: data.user.username || "",
            name: data.user.name || "",
            email: data.user.email || "",
            password: "",
            confirmPassword: "",
          });
        }
      } catch (e) {
        if (!off) setError(e.message || "Failed to load profile");
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => {
      off = true;
    };
  }, []);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const usernameOk = form.username.trim().length >= 3;
  const nameOk = !!form.name.trim() && /^[a-zA-Z\s]+$/.test(form.name);
  const emailOk = /\S+@\S+\.\S+/.test(form.email);
  const pwdOk =
    !wantsPwdChange ||
    (form.password.length >= 6 &&
      form.confirmPassword.length >= 6 &&
      form.password === form.confirmPassword);
  const formValid = usernameOk && nameOk && emailOk && pwdOk;

  const enterEdit = () => {
    setEditing(true);
    setSuccess("");
    setError("");
    setWantsPwdChange(false);
    setShowPwd(false);
    setShowPwd2(false);
    setForm((p) => ({ ...p, password: "", confirmPassword: "" }));
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.username.trim())
      return setError("Username is required.");
    if (form.username.trim().length < 3)
      return setError("Username must be at least 3 characters long.");
    if (!form.name.trim()) return setError("Full name is required.");
    if (!/^[a-zA-Z\s]+$/.test(form.name))
      return setError("Name can only contain letters and spaces.");
    if (!form.email.trim()) return setError("Email is required.");
    if (!/\S+@\S+\.\S+/.test(form.email))
      return setError("Please enter a valid email address.");
    if (wantsPwdChange) {
      if (!form.password) return setError("Password is required.");
      if (form.password.length < 6)
        return setError("Password must be at least 6 characters long.");
      if (form.password !== form.confirmPassword)
        return setError("Passwords do not match.");
    }

    if (saving) return;
    setSaving(true);

    try {
      const r1 = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          username: form.username,
        }),
      });
      const d1 = await r1.json();
      if (!r1.ok) throw new Error(d1?.message || "Failed to save profile");

      if (wantsPwdChange) {
        const r2 = await fetch("/api/profile/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            newPassword: form.password,
            confirmPassword: form.confirmPassword,
          }),
        });
        let d2 = null;
        const ct = r2.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          try {
            d2 = await r2.json();
          } catch {}
        }
        if (!r2.ok) throw new Error(d2?.message || "Failed to change password");
      }

      setSuccess("Saved");
      setEditing(false);
      setWantsPwdChange(false);
      setShowPwd(false);
      setShowPwd2(false);
      setForm((p) => ({ ...p, password: "", confirmPassword: "" }));
    } catch (e) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setError("");
    setSuccess("");
    const res = await fetch("/api/profile", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ confirmUsername }),
    });
    let data = null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      try {
        data = await res.json();
      } catch {}
    }
    if (!res.ok) {
      setError(data?.message || "Failed to delete account");
      return;
    }
    try {
      await refresh?.();
    } catch {}
    router.replace("/");
  };

  const triggerExport = (format) => {
    setError("");
    setSuccess("");
    window.location.href = `/api/export?format=${encodeURIComponent(
      format
    )}`;
  };

  if (loading) return null;

  return (
    <div className={styles.profileLayout}>
      <div className={styles.profileSideTitle}>
        {editing ? "Edit\nProfile" : "User\nProfile"}
      </div>

      <div className={styles.profileCard}>
        {!editing ? (
          <>
            <div className={styles.field}>
              <label className={styles.profileLabel}>Username:</label>
              <input
                className={styles.profileInput}
                value={form.username}
                readOnly
              />
            </div>
            <div className={styles.field}>
              <label className={styles.profileLabel}>Name:</label>
              <input
                className={styles.profileInput}
                value={form.name}
                readOnly
              />
            </div>
            <div className={styles.field}>
              <label className={styles.profileLabel}>Email:</label>
              <input
                className={styles.profileInput}
                value={form.email}
                readOnly
              />
            </div>
            <div className={styles.field}>
              <label className={styles.profileLabel}>Password:</label>
              <input
                className={styles.profileInput}
                type="password"
                value="************"
                readOnly
              />
            </div>

            {(error || success) && (
              <div className={styles.messageContainer}>
                {error && <p>{error}</p>}
                {success && <p className={styles.success}>{success}</p>}
              </div>
            )}

            <div className={styles.centerBtnRow}>
              <button
                className={styles.primaryWideBtn}
                type="button"
                onClick={enterEdit}
              >
                Edit
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submitEdit}>
            <div className={styles.field}>
              <label className={styles.profileLabel}>Username:</label>
              <input
                className={styles.profileInput}
                name="username"
                value={form.username}
                onChange={onChange}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.profileLabel}>Name:</label>
              <input
                className={styles.profileInput}
                name="name"
                value={form.name}
                onChange={onChange}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.profileLabel}>Email:</label>
              <input
                className={styles.profileInput}
                name="email"
                value={form.email}
                onChange={onChange}
              />
            </div>

            {!wantsPwdChange ? (
              <div className={styles.field}>
                <label className={styles.profileLabel}>Password:</label>
                <div className={styles.inlinePwdRow}>
                  <input
                    className={styles.profileInput}
                    type="password"
                    value="************"
                    readOnly
                  />
                  <button
                    type="button"
                    className={styles.smallLinkBtn}
                    onClick={() => {
                      setWantsPwdChange(true);
                      setShowPwd(false);
                      setShowPwd2(false);
                      setForm((p) => ({
                        ...p,
                        password: "",
                        confirmPassword: "",
                      }));
                    }}
                  >
                    Change password
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.field}>
                  <label className={styles.profileLabel}>
                    New password:
                  </label>
                  <div className={styles.pwdWrap}>
                    <input
                      className={styles.profileInput}
                      name="password"
                      type={showPwd ? "text" : "password"}
                      value={form.password}
                      onChange={onChange}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPwd((v) => !v)}
                    >
                      👁
                    </button>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.profileLabel}>
                    Confirm new password:
                  </label>
                  <div className={styles.pwdWrap}>
                    <input
                      className={styles.profileInput}
                      name="confirmPassword"
                      type={showPwd2 ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={onChange}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPwd2((v) => !v)}
                    >
                      👁
                    </button>
                  </div>
                  {form.confirmPassword &&
                    form.password !== form.confirmPassword && (
                      <div className={styles.pwdError}>
                        Passwords do not match.
                      </div>
                    )}
                  <div className={styles.smallRow}>
                    <button
                      type="button"
                      className={styles.smallLinkBtn}
                      onClick={() => {
                        setWantsPwdChange(false);
                        setForm((p) => ({
                          ...p,
                          password: "",
                          confirmPassword: "",
                        }));
                      }}
                    >
                      Cancel password change
                    </button>
                  </div>
                </div>
              </>
            )}

            {(error || success) && (
              <div className={styles.messageContainer}>
                {error && <p>{error}</p>}
                {success && <p className={styles.success}>{success}</p>}
              </div>
            )}

            <div className={styles.centerBtnRow}>
              <button
                className={styles.primaryWideBtn}
                type="submit"
                disabled={saving || !formValid}
                title={
                  !formValid
                    ? "Fill all fields. If changing password, both boxes must match (6+ chars)."
                    : ""
                }
              >
                {saving ? "Saving..." : "Confirm"}
              </button>
            </div>
          </form>
        )}
      </div>

      {!editing ? (
        <div className={styles.profileSideButtons}>
          {!showExportMenu ? (
            <button
              className={styles.sideBtn}
              type="button"
              onClick={() => {
                setShowExportMenu(true);
                setConfirmingDelete(false);
              }}
            >
              Export
            </button>
          ) : (
            <div className={styles.confirmCard}>
              <div className={styles.confirmTitle}>Export data</div>
              <div className={styles.confirmText}>
                Download your favorites, search history, and related data.
              </div>
              <div className={styles.confirmRow}>
                <button
                  className={styles.confirmBtn}
                  type="button"
                  onClick={() => triggerExport("json")}
                >
                  JSON
                </button>
                <button
                  className={styles.confirmBtn}
                  type="button"
                  onClick={() => triggerExport("csv")}
                >
                  CSV
                </button>
              </div>
              <button
                className={styles.cancelBtn}
                type="button"
                onClick={() => setShowExportMenu(false)}
              >
                Close
              </button>
            </div>
          )}

          {!confirmingDelete ? (
            <button
              className={styles.sideBtn}
              type="button"
              onClick={() => {
                setConfirmingDelete(true);
                setShowExportMenu(false);
              }}
            >
              Delete
            </button>
          ) : (
            <div className={styles.confirmCard}>
              <div className={styles.confirmTitle}>Delete account</div>
              <div className={styles.confirmText}>
                Type your username to confirm:
              </div>
              <input
                className={styles.profileInput}
                value={confirmUsername}
                onChange={(e) => setConfirmUsername(e.target.value)}
              />
              <div className={styles.confirmRow}>
                <button
                  className={styles.confirmBtn}
                  type="button"
                  onClick={confirmDelete}
                  disabled={!confirmUsername.trim()}
                >
                  Confirm
                </button>
                <button
                  className={styles.cancelBtn}
                  type="button"
                  onClick={() => {
                    setConfirmingDelete(false);
                    setConfirmUsername("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div />
      )}
    </div>
  );
}
