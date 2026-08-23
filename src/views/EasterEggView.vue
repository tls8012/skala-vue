<script setup>
import { ref } from 'vue'
import axios from 'axios'

const deckId = ref(null)
const remaining = ref(0)
const loading = ref(false)
const error = ref(null)

const playerCards = ref([])
const bankerCards = ref([])
const playerTotal = ref(null)
const bankerTotal = ref(null)
const result = ref('')

const history = ref([]) // recent rounds, newest first (max 10)

// betting state
const balance = ref(1000)
const betAmount = ref(0)
const betTarget = ref('Player') // 'Player' | 'Banker' | 'Tie'
const lastChange = ref(0) // last net change

function loadHistory() {
  try {
    const raw = localStorage.getItem('baccaratHistory')
    if (raw) history.value = JSON.parse(raw)
  } catch (e) {
    // ignore
    console.log(e)
  }
}
function saveHistory() {
  try {
    localStorage.setItem('baccaratHistory', JSON.stringify(history.value))
  } catch (e) {
    console.log(e)
  }
}
function loadBalance() {
  try {
    const raw = localStorage.getItem('baccaratBalance')
    if (raw !== null) balance.value = parseFloat(raw)
  } catch (e) {
    console.log(e)
  }
}
function saveBalance() {
  try {
    localStorage.setItem('baccaratBalance', String(balance.value))
  } catch (e) {
    console.log(e)
  }
}

function pushHistoryEntry(profit = 0) {
  const entry = {
    id: Date.now(),
    time: new Date().toLocaleString(),
    player: {
      cards: playerCards.value.map((c) => ({ code: c.code, image: c.image })),
      total: playerTotal.value,
    },
    banker: {
      cards: bankerCards.value.map((c) => ({ code: c.code, image: c.image })),
      total: bankerTotal.value,
    },
    result: result.value,
    bet: {
      amount: Number(betAmount.value),
      target: betTarget.value,
      profit: Number(profit),
    },
    balanceAfter: Number(balance.value),
  }
  history.value.unshift(entry)
  if (history.value.length > 10) history.value.pop()
  saveHistory()
}

function clearHistory() {
  history.value = []
  saveHistory()
}

// create a 6-deck shoe
async function initDeck() {
  loading.value = true
  error.value = null
  try {
    loadHistory()
    loadBalance()
    const res = await axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/', {
      params: { deck_count: 6 },
    })
    deckId.value = res.data.deck_id
    remaining.value = res.data.remaining
    resetRound()
  } catch (err) {
    error.value = 'Failed to initialize deck: ' + err.message
  } finally {
    loading.value = false
  }
}

function resetRound() {
  playerCards.value = []
  bankerCards.value = []
  playerTotal.value = null
  bankerTotal.value = null
  result.value = ''
}

function cardPoint(card) {
  // card.value is like 'ACE','2',...'KING'
  const v = card.value
  if (v === 'ACE') return 1
  if (['KING', 'QUEEN', 'JACK', '10'].includes(v)) return 0
  return parseInt(v)
}

function sumPoints(cards) {
  const s = cards.reduce((acc, c) => acc + cardPoint(c), 0)
  return s % 10
}

async function drawCards(count) {
  if (!deckId.value) throw new Error('No deck')
  const res = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId.value}/draw/`, {
    params: { count },
  })
  remaining.value = res.data.remaining
  return res.data.cards
}

function settleBet() {
  // Determine profit (positive = win, negative = loss, zero = push/no bet)
  const bet = Number(betAmount.value)
  if (!bet || bet <= 0) {
    lastChange.value = 0
    return 0
  }

  const side =
    result.value === 'Player wins' ? 'Player' : result.value === 'Banker wins' ? 'Banker' : 'Tie'

  const profit = (() => {
    if (side === 'Tie') {
      if (betTarget.value === 'Tie') {
        return +(bet * 8).toFixed(2)
      }
      // push for Player/Banker bets on Tie: no change
      return 0
    }

    if (side === betTarget.value) {
      if (betTarget.value === 'Banker') {
        return +(bet * 0.95).toFixed(2) // 5% commission
      }
      return +(bet * 1).toFixed(2)
    }

    // lost
    return -bet
  })()

  // apply profit to balance
  balance.value = +(balance.value + profit).toFixed(2)
  lastChange.value = profit
  saveBalance()
  return profit
}

async function playRound() {
  // validate bet
  const bet = Number(betAmount.value)
  if (bet > 0 && bet > balance.value) {
    error.value = 'Bet exceeds balance'
    return
  }

  loading.value = true
  error.value = null
  resetRound()
  try {
    // draw initial 4 cards: player 2 then banker 2
    const cards = await drawCards(4)
    // distribution: player first two, banker next two
    playerCards.value = cards.slice(0, 2)
    bankerCards.value = cards.slice(2, 4)

    playerTotal.value = sumPoints(playerCards.value)
    bankerTotal.value = sumPoints(bankerCards.value)

    // natural check
    if (playerTotal.value >= 8 || bankerTotal.value >= 8) {
      finalize()
      const profit = settleBet()
      pushHistoryEntry(profit)
      return
    }

    // Player third card rule
    let playerDrew = false
    let playerThird = null
    if (playerTotal.value <= 5) {
      const [third] = await drawCards(1)
      playerCards.value.push(third)
      playerDrew = true
      playerThird = cardPoint(third)
      playerTotal.value = sumPoints(playerCards.value)
    }

    // Banker rules
    // If player didn't draw: banker draws if bankerTotal <=5
    if (!playerDrew) {
      if (bankerTotal.value <= 5) {
        const [bthird] = await drawCards(1)
        bankerCards.value.push(bthird)
        bankerTotal.value = sumPoints(bankerCards.value)
      }
    } else {
      // complex banker draw rules based on player's third card
      const ptv = playerThird // 0-9
      const bt = bankerTotal.value
      let bankerShouldDraw = false
      if (bt <= 2) bankerShouldDraw = true
      else if (bt === 3 && ptv !== 8) bankerShouldDraw = true
      else if (bt === 4 && ptv >= 2 && ptv <= 7) bankerShouldDraw = true
      else if (bt === 5 && ptv >= 4 && ptv <= 7) bankerShouldDraw = true
      else if (bt === 6 && (ptv === 6 || ptv === 7)) bankerShouldDraw = true
      // bt ===7 -> stand
      if (bankerShouldDraw) {
        const [bthird] = await drawCards(1)
        bankerCards.value.push(bthird)
        bankerTotal.value = sumPoints(bankerCards.value)
      }
    }

    finalize()
    const profit = settleBet()
    pushHistoryEntry(profit)
  } catch (err) {
    error.value = 'Play failed: ' + err.message
  } finally {
    loading.value = false
  }
}

function finalize() {
  // ensure totals updated
  playerTotal.value = sumPoints(playerCards.value)
  bankerTotal.value = sumPoints(bankerCards.value)

  if (playerTotal.value > bankerTotal.value) result.value = 'Player wins'
  else if (bankerTotal.value > playerTotal.value) result.value = 'Banker wins'
  else result.value = 'Tie'
}

async function reshuffleIfLow() {
  if (!deckId.value) return
  if (remaining.value < 6) {
    await axios.get(`https://deckofcardsapi.com/api/deck/${deckId.value}/shuffle/`)
    const res = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId.value}/`) // get remaining
    remaining.value = res.data.remaining
  }
}

async function playAndReshuffle() {
  await playRound()
  await reshuffleIfLow()
}

// initialize on mount
loadHistory()
loadBalance()
initDeck()
</script>

<template>
  <div class="baccarat" style="display: flex; gap: 1.5rem; align-items: flex-start">
    <div style="flex: 1">
      <h2>Baccarat - 간단 버전</h2>

      <div v-if="error" style="color: red">{{ error }}</div>
      <div v-if="loading">Loading...</div>

      <!-- Betting controls -->
      <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem">
        <div style="display: flex; flex-direction: column">
          <div style="font-weight: 600">Balance: {{ balance.toFixed(2) }}</div>
          <div style="font-size: 0.85rem; color: #666">
            Last change:
            <span :style="{ color: lastChange > 0 ? '#0a0' : lastChange < 0 ? '#a00' : '#666' }"
              >{{ lastChange >= 0 ? '+' : '' }}{{ lastChange }}</span
            >
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; align-items: center; margin-left: 1rem">
          <label style="font-size: 0.9rem">Bet on:</label>
          <select v-model="betTarget">
            <option value="Player">Player</option>
            <option value="Banker">Banker</option>
            <option value="Tie">Tie</option>
          </select>
        </div>

        <div style="display: flex; gap: 0.5rem; align-items: center; margin-left: 1rem">
          <label style="font-size: 0.9rem">Amount:</label>
          <input type="number" v-model.number="betAmount" min="0" step="1" style="width: 110px" />
        </div>
      </div>

      <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem">
        <button @click="initDeck">New Shoe (6 decks)</button>
        <button
          @click="playAndReshuffle"
          :disabled="loading || (betAmount > 0 && betAmount > balance)"
        >
          Play Round
        </button>
        <button @click="clearHistory">Clear History</button>
        <span style="margin-left: 1rem">Deck remaining: {{ remaining }}</span>
      </div>

      <section style="margin-top: 1rem; display: flex; gap: 2rem">
        <div style="flex: 1">
          <h3>Player ({{ playerTotal !== null ? playerTotal : '-' }})</h3>
          <div style="display: flex; gap: 0.5rem; align-items: flex-end">
            <img v-for="c in playerCards" :key="c.code" :src="c.image" :alt="c.code" width="90" />
          </div>
        </div>

        <div style="flex: 1">
          <h3>Banker ({{ bankerTotal !== null ? bankerTotal : '-' }})</h3>
          <div style="display: flex; gap: 0.5rem; align-items: flex-end">
            <img v-for="c in bankerCards" :key="c.code" :src="c.image" :alt="c.code" width="90" />
          </div>
        </div>
      </section>

      <div style="margin-top: 1rem"><strong>Result:</strong> {{ result || '—' }}</div>

      <p style="margin-top: 1rem; font-size: 0.9rem; color: #666">
        참고: 실제 바카라 규칙(뱅커의 일부 예외 등)은 구현되어 있습니다. 간단히 즐기기 용도입니다.
      </p>
    </div>

    <aside style="width: 360px; border-left: 1px solid #eee; padding-left: 1rem">
      <h3>최근 대전 기록 (최대 10)</h3>
      <div v-if="history.length === 0" style="color: #666">기록 없음</div>
      <ul
        style="
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        "
      >
        <li
          v-for="entry in history"
          :key="entry.id"
          style="
            display: flex;
            gap: 0.5rem;
            align-items: center;
            border: 1px solid #f0f0f0;
            padding: 0.5rem;
            border-radius: 6px;
          "
        >
          <div style="width: 80px">
            <div style="font-size: 0.8rem; color: #666">
              {{ entry.time.split(' ')[0] }}<br />{{ entry.time.split(' ')[1] || '' }}
            </div>
          </div>
          <div style="flex: 1; display: flex; gap: 0.4rem; align-items: center">
            <div style="text-align: center">
              <div style="font-size: 0.75rem; color: #777">P {{ entry.player.total }}</div>
              <div
                style="display: flex; gap: 0.25rem; justify-content: center; margin-top: 0.25rem"
              >
                <img v-for="c in entry.player.cards" :key="c.code" :src="c.image" width="36" />
              </div>
            </div>

            <div style="text-align: center">
              <div style="font-size: 0.75rem; color: #777">B {{ entry.banker.total }}</div>
              <div
                style="display: flex; gap: 0.25rem; justify-content: center; margin-top: 0.25rem"
              >
                <img v-for="c in entry.banker.cards" :key="c.code" :src="c.image" width="36" />
              </div>
            </div>
          </div>

          <div style="width: 130px; text-align: center">
            <div style="font-weight: 600">{{ entry.result }}</div>
            <div style="font-size: 0.8rem; color: #444; margin-top: 0.25rem">
              Bet: {{ entry.bet ? entry.bet.amount : '-' }} on {{ entry.bet ? entry.bet.target : '-' }}
            </div>
            <div
              :style="{
                color: (entry.bet && entry.bet.profit > 0) ? '#0a0' : (entry.bet && entry.bet.profit < 0) ? '#a00' : '#666',
                marginTop: '.15rem',
                fontSize: '.85rem',
              }"
            >
              {{ entry.bet ? (entry.bet.profit > 0 ? '+' : '') + entry.bet.profit : '-' }}
            </div>
            <div style="font-size: 0.75rem; color: #666; margin-top: 0.15rem">
              Bal: {{ entry.balanceAfter !== undefined ? Number(entry.balanceAfter).toFixed(2) : '-' }}
            </div>
          </div>
        </li>
      </ul>
    </aside>
  </div>
</template>
