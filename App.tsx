import React, { useState } from "react";
// SVG-иконки собак
const dogSvgs = [
  <svg width="28" height="28" viewBox="0 0 64 64" key="dog1">
    <circle cx="32" cy="32" r="30" fill="#f9e4b7" />
    <ellipse cx="20" cy="28" rx="8" ry="12" fill="#b48a78" />
    <ellipse cx="44" cy="28" rx="8" ry="12" fill="#b48a78" />
    <ellipse cx="32" cy="38" rx="18" ry="16" fill="#fff" />
    <ellipse cx="32" cy="38" rx="14" ry="12" fill="#f9e4b7" />
    <ellipse cx="24" cy="36" rx="2.5" ry="3.5" fill="#222" />
    <ellipse cx="40" cy="36" rx="2.5" ry="3.5" fill="#222" />
    <ellipse cx="32" cy="44" rx="3" ry="2" fill="#222" />
  </svg>,
  <svg width="28" height="28" viewBox="0 0 64 64" key="dog2">
    <circle cx="32" cy="32" r="30" fill="#e2c290" />
    <ellipse cx="16" cy="24" rx="7" ry="11" fill="#7c5a3a" />
    <ellipse cx="48" cy="24" rx="7" ry="11" fill="#7c5a3a" />
    <ellipse cx="32" cy="38" rx="18" ry="16" fill="#fff" />
    <ellipse cx="32" cy="38" rx="14" ry="12" fill="#e2c290" />
    <ellipse cx="26" cy="36" rx="2.5" ry="3.5" fill="#222" />
    <ellipse cx="38" cy="36" rx="2.5" ry="3.5" fill="#222" />
    <ellipse cx="32" cy="44" rx="3" ry="2" fill="#222" />
  </svg>,
  <svg width="28" height="28" viewBox="0 0 64 64" key="dog3">
    <circle cx="32" cy="32" r="30" fill="#d1bfa3" />
    <ellipse cx="18" cy="30" rx="8" ry="10" fill="#a88c6b" />
    <ellipse cx="46" cy="30" rx="8" ry="10" fill="#a88c6b" />
    <ellipse cx="32" cy="38" rx="18" ry="16" fill="#fff" />
    <ellipse cx="32" cy="38" rx="14" ry="12" fill="#d1bfa3" />
    <ellipse cx="28" cy="36" rx="2.5" ry="3.5" fill="#222" />
    <ellipse cx="36" cy="36" rx="2.5" ry="3.5" fill="#222" />
    <ellipse cx="32" cy="44" rx="3" ry="2" fill="#222" />
  </svg>,
  <svg width="28" height="28" viewBox="0 0 64 64" key="dog4">
    <circle cx="32" cy="32" r="30" fill="#f5d6c6" />
    <ellipse cx="20" cy="26" rx="7" ry="12" fill="#b97a56" />
    <ellipse cx="44" cy="26" rx="7" ry="12" fill="#b97a56" />
    <ellipse cx="32" cy="38" rx="18" ry="16" fill="#fff" />
    <ellipse cx="32" cy="38" rx="14" ry="12" fill="#f5d6c6" />
    <ellipse cx="24" cy="36" rx="2.5" ry="3.5" fill="#222" />
    <ellipse cx="40" cy="36" rx="2.5" ry="3.5" fill="#222" />
    <ellipse cx="32" cy="44" rx="3" ry="2" fill="#222" />
  </svg>,
];

// Типы для игроков и раундов
type Player = {
  name: string;
};

type Round = {
  cards: number;
  bids: number[];
  tricks: number[];
  scores: number[];
};

const TOTAL_ROUNDS = 24;
const PLAYERS_COUNT = 4;

// Функция для генерации количества карт в каждом раунде
function getCardsPerRound(): number[] {
  const rounds: number[] = [];
  // 1 -> 8
  for (let i = 1; i <= 8; i++) rounds.push(i);
  // 4 раза по 9
  for (let i = 0; i < 4; i++) rounds.push(9);
  // 8 -> 1
  for (let i = 8; i >= 1; i--) rounds.push(i);
  // 4 раза по 9
  for (let i = 0; i < 4; i++) rounds.push(9);
  return rounds;
}

// Подсчёт очков по правилам
function calculateScore(
  bid: number,
  trick: number,
  cardsInRound: number
): number {
  // Хишт: заказал >=1, взял 0
  if (bid > 0 && trick === 0) return -200;
  // Пас (0 взяток, выполнен)
  if (bid === 0 && trick === 0) return 50;
  // Взял все взятки, и заказал все
  if (bid === cardsInRound && trick === cardsInRound) return 100 * cardsInRound;
  // Угадал заказ
  if (bid === trick && bid > 0) return 100 + (bid - 1) * 50;
  // Промах
  return trick * 10;
}

const cardsPerRound = getCardsPerRound();

export default function App() {
  // Состояния
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array(PLAYERS_COUNT).fill("")
  );
  const [namesConfirmed, setNamesConfirmed] = useState(false);

  // Массив раундов: для каждого раунда — массив заказов и взяток
  const [rounds, setRounds] = useState<Round[]>(
    cardsPerRound.map((cards) => ({
      cards,
      bids: Array(PLAYERS_COUNT).fill(""),
      tricks: Array(PLAYERS_COUNT).fill(""),
      scores: Array(PLAYERS_COUNT).fill(0),
    }))
  );

  // Общий счёт
  const totalScores = Array(PLAYERS_COUNT)
    .fill(0)
    .map((_, idx) =>
      rounds.reduce((sum, round) => sum + (round.scores[idx] || 0), 0)
    );

  // Обработка ввода имён
  const handleNameChange = (idx: number, value: string) => {
    const newNames = [...playerNames];
    newNames[idx] = value;
    setPlayerNames(newNames);
  };

  // Подтвердить имена
  const handleConfirmNames = () => {
    if (playerNames.every((n) => n.trim() !== "")) {
      setNamesConfirmed(true);
    } else {
      alert("Введите имена всех игроков!");
    }
  };

  // Обработка ввода заказов и взяток
  const handleInputChange = (
    roundIdx: number,
    playerIdx: number,
    type: "bids" | "tricks",
    value: string
  ) => {
    const newRounds = rounds.map((r) => ({ ...r }));
    const num = value === "" ? "" : Math.max(0, Number(value));
    newRounds[roundIdx][type][playerIdx] = num;

    // Если оба значения есть — пересчитать очки
    for (let i = 0; i < PLAYERS_COUNT; i++) {
      const bid = Number(newRounds[roundIdx].bids[i]);
      const trick = Number(newRounds[roundIdx].tricks[i]);
      if (
        !isNaN(bid) &&
        !isNaN(trick) &&
        newRounds[roundIdx].bids[i] !== "" &&
        newRounds[roundIdx].tricks[i] !== ""
      ) {
        newRounds[roundIdx].scores[i] = calculateScore(
          bid,
          trick,
          newRounds[roundIdx].cards
        );
      } else {
        newRounds[roundIdx].scores[i] = 0;
      }
    }
    setRounds(newRounds);
  };

  // Сбросить игру
  const handleReset = () => {
    setNamesConfirmed(false);
    setPlayerNames(Array(PLAYERS_COUNT).fill(""));
    setRounds(
      cardsPerRound.map((cards) => ({
        cards,
        bids: Array(PLAYERS_COUNT).fill(""),
        tricks: Array(PLAYERS_COUNT).fill(""),
        scores: Array(PLAYERS_COUNT).fill(0),
      }))
    );
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h1>Счёт для Джокера</h1>
      {!namesConfirmed ? (
        <div style={{ marginBottom: 24 }}>
          <h2>Введите имена игроков</h2>
          {playerNames.map((name, idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              <input
                type="text"
                placeholder={`Игрок ${idx + 1}`}
                value={name}
                onChange={(e) => handleNameChange(idx, e.target.value)}
              />
            </div>
          ))}
          <button onClick={handleConfirmNames}>Начать игру</button>
        </div>
      ) : (
        <>
          <button onClick={handleReset} style={{ marginBottom: 16 }}>
            Новая игра
          </button>
          <table
            border={1}
            cellPadding={4}
            style={{ borderCollapse: "collapse", width: "100%" }}
          >
            <thead>
              <tr>
                <th>Раунд</th>
                <th>Карт</th>
                {playerNames.map((name, idx) => (
                  <th key={idx} colSpan={3} style={{ textAlign: "center" }}>
                    <span style={{ verticalAlign: "middle", marginRight: 4 }}>
                      {dogSvgs[idx]}
                    </span>
                    {name}
                  </th>
                ))}
              </tr>
              <tr>
                <th></th>
                <th></th>
                {playerNames.map((_, idx) => (
                  <React.Fragment key={idx}>
                    <th>Заказ</th>
                    <th>Взято</th>
                    <th>Очки</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {rounds.map((round, roundIdx) => (
                <tr key={roundIdx}>
                  <td>{roundIdx + 1}</td>
                  <td>{round.cards}</td>
                  {playerNames.map((_, playerIdx) => (
                    <React.Fragment key={playerIdx}>
                      <td>
                        <input
                          type="number"
                          min={0}
                          max={round.cards}
                          value={round.bids[playerIdx]}
                          onChange={(e) =>
                            handleInputChange(
                              roundIdx,
                              playerIdx,
                              "bids",
                              e.target.value
                            )
                          }
                          style={{ width: 50 }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          max={round.cards}
                          value={round.tricks[playerIdx]}
                          onChange={(e) =>
                            handleInputChange(
                              roundIdx,
                              playerIdx,
                              "tricks",
                              e.target.value
                            )
                          }
                          style={{ width: 50 }}
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {round.scores[playerIdx] !== 0
                          ? round.scores[playerIdx]
                          : ""}
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} style={{ textAlign: "right" }}>
                  <b>Сумма</b>
                </td>
                {totalScores.map((score, idx) => (
                  <td key={idx} colSpan={3} style={{ textAlign: "center" }}>
                    <b>{score}</b>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </>
      )}
    </div>
  );
}
