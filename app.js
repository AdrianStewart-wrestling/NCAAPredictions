
document.addEventListener('DOMContentLoaded', function () {
  let bracketData;

  fetch('bracket125.json')
    .then(response => response.json())
    .then(data => {
      bracketData = data;
      renderBrackets(data);
    });

  function renderBrackets(data) {
    const champDiv = document.getElementById('champBracket');
    const consDiv = document.getElementById('consBracket');
    champDiv.innerHTML = '';
    consDiv.innerHTML = '';

    const champRounds = ['Prelim', 'ChampR1', 'ChampR2', 'Quarterfinal', 'Semifinal', 'Final'];
    const consRounds = ['ConsPrelim', 'ConsR1', 'ConsR2', 'ConsR3', 'ConsR4', 'ConsQTR', 'ConsSEMI', '3rd', '5th', '7th'];

    const byRound = data.reduce((acc, match) => {
      if (!acc[match.round]) acc[match.round] = [];
      acc[match.round].push(match);
      return acc;
    }, {});

    const champWrapper = document.createElement('div');
    champWrapper.className = 'bracket-container';
    champRounds.forEach(round => {
      if (byRound[round]) {
        const col = document.createElement('div');
        col.className = 'round-column';
        col.innerHTML = `<h3>${round}</h3>`;
        byRound[round].forEach(match => col.appendChild(createMatchEl(match)));
        champWrapper.appendChild(col);
      }
    });
    champDiv.appendChild(champWrapper);

    const consWrapper = document.createElement('div');
    consWrapper.className = 'bracket-container';
    consRounds.forEach(round => {
      if (byRound[round]) {
        const col = document.createElement('div');
        col.className = 'round-column';
        col.innerHTML = `<h3>${round}</h3>`;
        byRound[round].forEach(match => col.appendChild(createMatchEl(match)));
        consWrapper.appendChild(col);
      }
    });
    consDiv.appendChild(consWrapper);
  }

  function createMatchEl(match) {
    const matchEl = document.createElement('div');
    matchEl.className = 'match';
    matchEl.innerHTML = `
      <div data-matchid="${match.matchId}" data-slot="wrestler1" class="wrestler1">${formatWrestler(match.wrestler1)}</div>
      <div data-matchid="${match.matchId}" data-slot="wrestler2" class="wrestler2">${formatWrestler(match.wrestler2)}</div>
    `;
    matchEl.querySelectorAll('div').forEach(div => {
      div.addEventListener('click', () => handleSelection(match, div.dataset.slot));
    });
    return matchEl;
  }

  function formatWrestler(wrestler) {
    if (!wrestler || !wrestler.name) return 'TBD';
    if (wrestler.seed && wrestler.school) {
      return `#${wrestler.seed} ${wrestler.name} (${wrestler.school})`;
    }
    return `${wrestler.name}`;
  }

  function handleSelection(match, slot) {
    const selectedWrestler = match[slot];
    if (!selectedWrestler || selectedWrestler.name === 'TBD') return;

    const opponentSlot = slot === 'wrestler1' ? 'wrestler2' : 'wrestler1';
    const loser = match[opponentSlot];
    const winner = selectedWrestler;

    if (match.winnerMatch != null) {
      const nextMatch = bracketData.find(m => m.matchId === match.winnerMatch);
      if (nextMatch && nextMatch[match.winnerSlot]?.name !== winner.name) {
        nextMatch[match.winnerSlot] = winner;
      }
    }

    if (match.loserMatch != null && loser && loser.name !== 'TBD') {
      const dropMatch = bracketData.find(m => m.matchId === match.loserMatch);
      if (dropMatch && dropMatch[match.loserSlot]?.name !== loser.name) {
        dropMatch[match.loserSlot] = loser;
      }
    }

    renderBrackets(bracketData);
  }

  document.getElementById('exportPDF').addEventListener('click', () => {
    document.querySelector('.weight-buttons').style.display = 'none';
    document.getElementById('exportPDF').style.display = 'none';

    const opt = {
      margin: 0.5,
      filename: 'bracket_125.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };

    html2pdf()
      .from(document.getElementById('bracketWrapper'))
      .save(opt)
      .then(() => {
        document.querySelector('.weight-buttons').style.display = 'block';
        document.getElementById('exportPDF').style.display = 'block';
      });
  });
});
