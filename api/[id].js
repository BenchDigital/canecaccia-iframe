// Mappa numeri giornate
const mappaNumeriGiornate = {
  1: "Prima", 2: "Seconda", 3: "Terza", 4: "Quarta", 5: "Quinta",
  6: "Sesta", 7: "Settima", 8: "Ottava", 9: "Nona", 10: "Decima",
  11: "Undicesima", 12: "Dodicesima", 13: "Tredicesima", 14: "Quattordicesima",
  15: "Quindicesima", 16: "Sedicesima", 17: "Diciassettesima", 18: "Diciottesima",
  19: "Diciannovesima", 20: "Ventesima", 21: "Ventunesima", 22: "Ventiduesima",
  23: "Ventitreesima", 24: "Ventiquattresima", 25: "Venticinquesima",
  26: "Ventiseiesima", 27: "Ventisettesima", 28: "Ventottesima",
  29: "Ventinovesima", 30: "Trentesima"
};

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getISOWeekYear(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return d.getUTCFullYear();
}

function isSameISOWeek(a, b) {
  return getISOWeek(a) === getISOWeek(b) && getISOWeekYear(a) === getISOWeekYear(b);
}

function generateTeamPlayersHTML(team, staffByTeam) {
  const players = [...(team.performances || [])].sort((a, b) => {
    if (a.points !== null && b.points !== null) return b.points - a.points;
    if (a.points !== null && b.points === null) return -1;
    if (a.points === null && b.points !== null) return 1;
    if (a.hasPlayed && !b.hasPlayed) return -1;
    if (!a.hasPlayed && b.hasPlayed) return 1;
    return 0;
  });
  
  const playersStr = players
    .filter(p => p.isCalledUp)
    .map(p => {
      if (p.points !== null && p.points !== undefined && p.hasPlayed) {
        return `${p.name} ${p.lastName} ${p.points}`;
      } else if (!p.hasPlayed) {
        return `${p.name} ${p.lastName} n.e.`;
      }
      return null;
    })
    .filter(Boolean)
    .join(', ');
    
  const staff = staffByTeam[team.teamId] || [];
  const allenatori = staff
    .filter(s => s.roleName && (s.roleName.includes('Allenatore') || s.roleName.includes('Coach')))
    .map(s => `${s.name} ${s.lastName}`);
  const assistenti = staff
    .filter(s => s.roleName && (s.roleName.includes('Assistente') || s.roleName.includes('Vice Coach') || s.roleName.includes('Vice Allenatore')))
    .map(s => `${s.name} ${s.lastName}`);

  let html = `<div style="display: gap: 10px;">
  <span class="team" style="white-space: nowrap;">${team.teamName}:</span>
  <span>
    <span>${playersStr || ''}</span>\n`;
  

  if (playersStr) {
  if (allenatori.length > 0) html += `    <span>All. ${allenatori.join(' - ')}</span>\n`;
  if (assistenti.length > 0) html += `    <span>Ass. ${assistenti.join(' - ')}</span>\n`;
  }
  return html + `  </span>\n</div>\n`;
}

function generateSingleMatchHTML(match, staffByTeam) {
  const homeTeam = match.homeTeam;
  const visitorsTeam = match.visitorsTeam;
  const homeScores = [homeTeam.pointsQ1, homeTeam.pointsQ2, homeTeam.pointsQ3, homeTeam.pointsQ4];
  const visitorsScores = [visitorsTeam.pointsQ1, visitorsTeam.pointsQ2, visitorsTeam.pointsQ3, visitorsTeam.pointsQ4];

  // const matchDate = match.date ? new Date(match.date).toLocaleDateString('it-IT') : '';
  // const matchTime = match.date ? new Date(match.date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '';

  const matchDate = match.date
  ? new Date(match.date).toLocaleDateString('it-IT', { timeZone: 'Europe/Rome' })
  : '';

const matchTime = match.date
  ? new Date(match.date).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Rome'  // ← aggiunto
    })
  : '';

  let html = '';
  const allHomeScoresNull = homeScores.every(score => score === null || score === undefined);

  if (allHomeScoresNull) {
    html += `<div>
  <span class="match">${homeTeam.teamName} - ${visitorsTeam.teamName}</span>
  <span>&nbsp;&nbsp;&nbsp;&nbsp;0 - 0&nbsp;&nbsp;&nbsp;${matchDate}&nbsp;${matchTime}</span>
</div>
<div class="team">${homeTeam.teamName}:</div>
<div class="team">${visitorsTeam.teamName}:</div>
<br>\n`;
  } else {
    const someScoresNull = homeScores.some(score => score === null || score === undefined);

    if (someScoresNull) {
      let lastQuarterHome = 0, lastQuarterVisitors = 0, quartersPlayed = 0;
      for (let i = 0; i < homeScores.length; i++) {
        if (homeScores[i] != null && visitorsScores[i] != null) {
          lastQuarterHome = homeScores[i];
          lastQuarterVisitors = visitorsScores[i];
          quartersPlayed++;
        }
      }

      const parzialiArray = [];
      for (let i = 0; i < quartersPlayed; i++) {
        parzialiArray.push(`${homeScores[i]}-${visitorsScores[i]}`);
      }

      html += `<div>
  <span class="match">${homeTeam.teamName} - ${visitorsTeam.teamName} ${lastQuarterHome}-${lastQuarterVisitors}</span>
  <span>Parziali ${parzialiArray.join(', ')}</span>
</div>\n`;
      html += generateTeamPlayersHTML(homeTeam, staffByTeam);
      html += generateTeamPlayersHTML(visitorsTeam, staffByTeam);
    } else {
      const hasOvertime = homeTeam.pointsOt != null;

      if (hasOvertime) {
        html += `<div style="display: gap: 10px;">
  <span class="match">${homeTeam.teamName} - ${visitorsTeam.teamName} ${homeTeam.pointsOt}-${visitorsTeam.pointsOt}</span>
  <span>Parziali ${homeScores[0]}-${visitorsScores[0]}, ${homeScores[1]}-${visitorsScores[1]}, ${homeScores[2]}-${visitorsScores[2]}, ${homeScores[3]}-${visitorsScores[3]}, D1ts</span>
</div>\n`;
      } else {
        html += `<div style="display: gap: 10px;">
  <span class="match">${homeTeam.teamName} - ${visitorsTeam.teamName} ${homeScores[3]}-${visitorsScores[3]}</span>
  <span>Parziali ${homeScores[0]}-${visitorsScores[0]}, ${homeScores[1]}-${visitorsScores[1]}, ${homeScores[2]}-${visitorsScores[2]}</span>
</div>\n`;
      }
      html += generateTeamPlayersHTML(homeTeam, staffByTeam);
      html += generateTeamPlayersHTML(visitorsTeam, staffByTeam);
    }
  }

  return html + '<br>\n';
}

function generateMatchHTML(groupedByDay, staffByTeam, midGiornata) {
  const htmlStart = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Partite</title>
    <style>
        body { font-size: 13px; font-family: Tahoma, sans-serif; color: #212121; margin: 10px; background-color: #FFFFFF; }
        .highlight { background-color: #FFFF99; }
        .match { font-weight: bold; }
        .team { text-decoration: underline; }
        .separator { width: 100%; height: 2px; background: url('./images/stringa2.png') no-repeat center; }
    </style>
</head>
<body>`;

  const htmlEnd = `<div class="separator"></div></body></html>`;

  let html = htmlStart;
  const today = new Date();
  let currentDay = Math.max(...Object.keys(groupedByDay).map(Number));

  for (const day of Object.keys(groupedByDay).sort((a, b) => Number(a) - Number(b))) {
    const matches = groupedByDay[day];
    if (matches.some(m => m.date && isSameISOWeek(new Date(m.date), today))) {
      currentDay = Number(day);
    }
  }

  const matches = groupedByDay[currentDay];
  if (!matches?.length) {
    return html + `<p>Nessuna partita trovata per la giornata ${currentDay}</p>` + htmlEnd;
  }

  // Titolo giornata
  if (currentDay > midGiornata) {
    html += `<span class="highlight">${mappaNumeriGiornate[currentDay - midGiornata] || (currentDay - midGiornata)} Giornata di Ritorno</span><br><br>\n`;
  } else {
    html += `<span class="highlight">${mappaNumeriGiornate[currentDay] || currentDay} Giornata di Andata</span><br><br>\n`;
  }

  matches.forEach(match => { html += generateSingleMatchHTML(match, staffByTeam); });

  return html + htmlEnd;
}

function generatePostSeasonHTML(competitionData, competitionId) {
  const { competitionName, groupedByDay, staffByTeam } = competitionData;

  const htmlStart = `<span class="highlight">${competitionName}</span><br><br>\n`;

  const today = new Date();
  let currentDay = Math.max(...Object.keys(groupedByDay).map(Number));

  for (const day of Object.keys(groupedByDay).sort((a, b) => Number(a) - Number(b))) {
    const matches = groupedByDay[day];
    if (matches.some(m => m.date && isSameISOWeek(new Date(m.date), today))) {
      currentDay = Number(day);
    }
  }

  const matches = groupedByDay[currentDay];
  if (!matches?.length) {
    return htmlStart + `<p>Nessuna partita trovata</p><br>\n`;
  }

  let html = htmlStart;
  html += `<span>Gara ${currentDay}</span><br><br>\n`;
  matches.forEach(match => { html += generateSingleMatchHTML(match, staffByTeam); });

  return html;
}

// // Vercel Serverless Function
// export default async function handler(req, res) {
//   const { id } = req.query;

//   if (!id) {
//     return res.status(400).send('Missing id parameter');
//   }

//   try {
//     const response = await fetch(`https://bench-qunt.onrender.com/iframe/${id}`);
    
//     if (!response.ok) {
//       return res.status(response.status).send('Error fetching data');
//     }

//     const data = await response.json();
//     const { groupedByDay, staffByTeam, midGiornata } = data;

//     const html = generateMatchHTML(groupedByDay, staffByTeam, midGiornata);

//     res.setHeader('Content-Type', 'text/html; charset=utf-8');
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.status(200).send(html);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// }

// Vercel Serverless Function
export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send('Missing id parameter');
  }

  try {
    const response = await fetch(`https://bench-qunt.onrender.com/iframe/${id}`);
    //const response = await fetch(`http://localhost:3000/iframe/${id}`);

    if (!response.ok) {
      return res.status(response.status).send('Error fetching data');
    }

    const data = await response.json();
    const ids = String(id).split(',');
    const isPostSeason = ids.length > 1;

    const htmlWrapper = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Partite</title>
    <style>
        body { font-size: 13px; font-family: Tahoma, sans-serif; color: #212121; margin: 10px; background-color: #FFFFFF; }
        .highlight { background-color: #FFFF99; }
        .match { font-weight: bold; }
        .team { text-decoration: underline; }
        .separator { width: 100%; height: 2px; background: url('./images/stringa2.png') no-repeat center; }
    </style>
</head>
<body>`;

    let bodyHtml = '';

    if (isPostSeason) {
      // data è { [competitionId]: { competitionName, groupedByDay, staffByTeam, midGiornata } }
      for (const competitionId of ids) {
        const competitionData = data[competitionId];
        if (competitionData) {
          bodyHtml += generatePostSeasonHTML(competitionData, competitionId);
          bodyHtml += `<div class="separator"></div>\n`;
        }
      }
    } else {
      const { groupedByDay, staffByTeam, midGiornata } = data;
      bodyHtml = generateMatchHTML(groupedByDay, staffByTeam, midGiornata)
        .replace(/<!DOCTYPE html>[\s\S]*?<body>/, '')
        .replace(/<\/body><\/html>/, '');
    }

    const html = isPostSeason
      ? htmlWrapper + bodyHtml + `</body></html>`
      : generateMatchHTML(data.groupedByDay, data.staffByTeam, data.midGiornata);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}
