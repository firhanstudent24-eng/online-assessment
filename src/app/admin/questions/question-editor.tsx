
"use client";

import { useState } from "react";

export default function QuestionEditor({ question }: { question?: any }) {
  const [type, setType] = useState(question?.type || "multiple_choice");
  const [prompt, setPrompt] = useState(question?.prompt || "");
  const [options, setOptions] = useState(
    (question?.options || ["", "", "", ""]).join("\n")
  );
  const [correctAnswer, setCorrectAnswer] = useState(
    question?.correct_answer || ""
  );
  const [explanation, setExplanation] = useState(
    question?.explanation || ""
  );
  const [position, setPosition] = useState(question?.position || 1);
  const [active, setActive] = useState(question?.active ?? true);
  const [required, setRequired] = useState(question?.required ?? true);
  const [msg, setMsg] = useState("");

  const optionList = options
    .split("\n")
    .map((x: string) => x.trim())
    .filter(Boolean);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (type === "multiple_choice") {
      if (optionList.length < 2) {
        setMsg("Pilihan ganda minimal memiliki dua opsi.");
        return;
      }

      if (!correctAnswer || !optionList.includes(correctAnswer)) {
        setMsg("Silakan tentukan jawaban yang benar.");
        return;
      }

      if (!explanation.trim()) {
        setMsg("Silakan isi penjelasan jawaban.");
        return;
      }
    }

    const res = await fetch("/api/admin/questions", {
      method: question ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: question?.id,
        type,
        prompt,
        options: type === "essay" ? [] : optionList,
        correct_answer:
          type === "multiple_choice" ? correctAnswer : null,
        explanation:
          type === "multiple_choice" ? explanation.trim() : null,
        position,
        active,
        required,
      }),
    });

    const d = await res.json();

    if (!res.ok) {
      setMsg(d.error || "Gagal menyimpan");
      return;
    }

    location.href = "/admin/questions";
  }

  async function remove() {
    if (!question || !confirm("Hapus soal ini?")) return;

    const r = await fetch(
      "/api/admin/questions?id=" + question.id,
      { method: "DELETE" }
    );

    if (r.ok) {
      location.href = "/admin/questions";
    } else {
      setMsg("Gagal menghapus soal.");
    }
  }

  return (
    <form onSubmit={save}>
      <div className="field">
        <label>Pertanyaan</label>
        <textarea
          className="area"
          required
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <div className="field">
        <label>Jenis soal</label>
        <select
          className="select"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="multiple_choice">Pilihan ganda</option>
          <option value="essay">Esai</option>
        </select>
      </div>

      {type === "multiple_choice" && (
        <>
          <div className="field">
            <label>Opsi jawaban (satu opsi per baris)</label>
            <textarea
              className="area"
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              placeholder={"A. ...\nB. ...\nC. ...\nD. ..."}
            />
          </div>

          <div className="field">
            <label>Jawaban yang benar</label>
            <select
              className="select"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              required
            >
              <option value="">-- Pilih jawaban benar --</option>
              {optionList.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Penjelasan jawaban</label>
            <textarea
              className="area"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Tuliskan pembahasan atau alasan jawaban tersebut benar..."
              required
            />
          </div>
        </>
      )}

      <div className="field">
        <label>Urutan tampil</label>
        <input
          className="input"
          type="number"
          min="1"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
        />
      </div>

      <label className="option">
        <input
          type="checkbox"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
        />
        Wajib dijawab
      </label>

      <label className="option">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        Publikasikan soal
      </label>

      {msg && <div className="notice error">{msg}</div>}

      <div className="row">
        <button className="btn">Simpan soal</button>

        {question && (
          <button
            type="button"
            className="btn danger"
            onClick={remove}
          >
            Hapus
          </button>
        )}

        <a className="btn secondary" href="/admin/questions">
          Batal
        </a>
      </div>
    </form>
  );
}