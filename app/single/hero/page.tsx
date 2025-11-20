// filepath: c:\Projekte\nextjs\imposter-kurdish\app\single\hero\page.tsx
'use client';

import React, { useState, useEffect } from 'react';

const EMOJIS = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦣','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🪶','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿','🦔'];

function getRandomEmojis(count: number) {
  const shuffled = [...EMOJIS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => 0.5 - Math.random());
}

export default function EmojiMemoryChain() {
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<string[]>([]);
  const [choices, setChoices] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [showSequence, setShowSequence] = useState(true);
  const [status, setStatus] = useState<'playing'|'won'|'lost'>('playing');

  // Initialisiere das Spiel oder gehe zum nächsten Level
  useEffect(() => {
    const newSeq = getRandomEmojis(level);
    setSequence(newSeq);
    setChoices(shuffle(newSeq));
    setUserInput([]);
    setShowSequence(true);
    setStatus('playing');
    // Zeige die Sequenz für 1.5s + 0.5s pro Level
    const timeout = setTimeout(() => setShowSequence(false), 1500 + level * 500);
    return () => clearTimeout(timeout);
  }, [level]);

  // Prüfe, ob der User fertig ist
  useEffect(() => {
    if (userInput.length === sequence.length && status === 'playing') {
      if (userInput.join() === sequence.join()) {
        setStatus('won');
        setTimeout(() => setLevel(l => l + 1), 1200);
      } else {
        setStatus('lost');
      }
    }
  }, [userInput, sequence, status]);

  function handleChoice(emoji: string) {
    if (showSequence || status !== 'playing') return;
    if (userInput.length < sequence.length) {
      setUserInput([...userInput, emoji]);
    }
  }

  function handleReset() {
    setLevel(1);
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8ffae 0%, #43c6ac 100%)',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{fontSize: 36, marginBottom: 8}}>🐾 Emoji Memory Chain 🧠</h1>
      <p style={{marginBottom: 24}}>Merke dir die Reihenfolge der Emojis!<br/>Jedes Level kommt ein neues Emoji dazu.<br/>Aber: Die Reihenfolge wird immer neu gemischt!</p>
      <div style={{
        fontSize: 40,
        letterSpacing: 8,
        marginBottom: 16,
        minHeight: 48,
        transition: 'opacity 0.3s',
        opacity: showSequence ? 1 : 0.2,
        userSelect: 'none'
      }}>
        {sequence.map((e, i) => <span key={i}>{e}</span>)}
      </div>
      {!showSequence && (
        <div style={{display: 'flex', gap: 12, marginBottom: 24}}>
          {choices.map((e, i) => (
            <button
              key={i}
              onClick={() => handleChoice(e)}
              disabled={userInput.includes(e) || status !== 'playing'}
              style={{
                fontSize: 32,
                padding: '8px 16px',
                borderRadius: 8,
                border: '2px solid #43c6ac',
                background: userInput.includes(e) ? '#eee' : '#fff',
                cursor: userInput.includes(e) ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {e}
            </button>
          ))}
        </div>
      )}
      <div style={{fontSize: 28, minHeight: 36, marginBottom: 16}}>
        {userInput.map((e, i) => <span key={i}>{e}</span>)}
      </div>
      {status === 'lost' && (
        <div style={{color: '#e74c3c', fontWeight: 600, marginBottom: 16, fontSize: 22}}>
          Falsch! Richtige Reihenfolge war: {sequence.join(' ')}
        </div>
      )}
      {status === 'won' && (
        <div style={{color: '#27ae60', fontWeight: 600, marginBottom: 16, fontSize: 22}}>
          Richtig! Nächstes Level...
        </div>
      )}
      <div style={{marginTop: 12}}>
        <span style={{fontSize: 18}}>Level: {level}</span>
        <button
          onClick={handleReset}
          style={{
            marginLeft: 24,
            padding: '6px 18px',
            fontSize: 16,
            borderRadius: 6,
            border: '1px solid #aaa',
            background: '#fff',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>
      <footer style={{marginTop: 40, fontSize: 14, color: '#888'}}>
        Idee & Umsetzung: GitHub Copilot · {new Date().getFullYear()}
      </footer>
    </div>
  );
}