
"use client";

import { useState } from "react";

type Question = {
  id: string;
  prompt: string;
  type: "multiple_choice" | "essay" | string;
  options: string[] | null;
  position: number;
  required: boolean;
};

type TestFormProps = {
  name: string;
  questions: Question[];
};

export default function TestForm({
  name,
  questions,
}: TestFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function updateAnswer(questionId: string, value: string) {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: value,
    }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    for (const q of questions) {
      if (q.required && !answers[q.id]?.trim()) {
        setError("Masih ada pertanyaan wajib yang belum dijawab.");
        document
          .getElementById(q.id)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }

    setBusy(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          answers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim jawaban.");
      }

      window.location.href = `/thanks?id=${encodeURIComponent(data.id)}`;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <div style={{ marginBottom: 20 }}>
        <strong>Nama peserta:</strong> {name}
      </div>

      {questions.map((q, index) => {
        const isEssay = q.type === "essay";

        return (
          <div
            className="q"
            id={q.id}
            key={q.id}
            style={{ marginBottom: 20 }}
          >
            <span className="pill">
              SOAL {index + 1} · {isEssay ? "ESAI" : "PILIHAN GANDA"}
            </span>

            <h3 style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
              {q.prompt}
              {q.required && (
                <span style={{ color: "red" }}> *</span>
              )}
            </h3>

            {isEssay ? (
              <textarea
                value={answers[q.id] || ""}
                onChange={(e) => updateAnswer(q.id, e.target.value)}
                placeholder="Tuliskan jawabanmu di sini..."
                rows={5}
                disabled={busy}
                required={q.required}
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  font: "inherit",
                  resize: "vertical",
                }}
              />
            ) : (
              <div style={{ marginTop: 12 }}>
                {(q.options || []).map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: 12,
                      marginBottom: 8,
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      cursor: busy ? "default" : "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={option}
                      checked={answers[q.id] === option}
                      onChange={() => updateAnswer(q.id, option)}
                      disabled={busy}
                      required={q.required && optionIndex === 0}
                      style={{ marginTop: 4 }}
                    />

                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {error && (
        <div
          style={{
            color: "#b42318",
            background: "#fee4e2",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        style={{
          width: "100%",
          padding: 14,
          cursor: busy ? "not-allowed" : "pointer",
        }}
      >
        {busy ? "Mengirim jawaban..." : "Kirim Jawaban"}
      </button>
    </form>
  );
}