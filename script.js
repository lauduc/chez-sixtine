// Données des congés
let conges = [];
let moisActuel = new Date().getMonth();
let anneeActuelle = new Date().getFullYear();

// Configuration GitHub - À personnaliser
const GITHUB_CONFIG = {
    owner: 'lauduc', // Remplacez par votre username GitHub
    repo: 'chez-sixtine',            // Remplacez par le nom de votre repo
    branch: 'main',
    token: null // Optionnel: pour l'authentification si repo privé
};

// Liste des personnes
const personnes = ['Alice', 'Bob', 'Claire', 'David', 'Emma', 'Franck', 'Gaelle', 'Hugo', 'Ines', 'Julien'];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('mois').value = moisActuel;
    document.getElementById('annee').value = anneeActuelle;
    
    // Afficher le chemin du fichier pour référence
    document.getElementById('githubPath').textContent = 
        `${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/blob/${GITHUB_CONFIG.branch}/data/conges.json`;
    
    chargerDepuisGitHub();
});

function afficherCalendrier() {
    const mois = parseInt(document.getElementById('mois').value);
    const annee = parseInt(document.getElementById('annee').value);
    
    const premierJour = new Date(annee, mois, 1);
    const dernierJour = new Date(annee, mois + 1, 0);
    
    const joursSemaine = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    let calendrierHTML = '';
    
    // En-tête des jours
    joursSemaine.forEach(jour => {
        calendrierHTML += `<div class="jour-semaine">${jour}</div>`;
    });
    
    // Cases vides pour le début du mois
    let premierJourSemaine = premierJour.getDay() || 7;
    premierJourSemaine = premierJourSemaine === 0 ? 7 : premierJourSemaine;
    
    for (let i = 1; i < premierJourSemaine; i++) {
        calendrierHTML += '<div class="jour vide"></div>';
    }
    
    // Jours du mois
    for (let jour = 1; jour <= dernierJour.getDate(); jour++) {
        const dateStr = `${annee}-${String(mois + 1).padStart(2, '0')}-${String(jour).padStart(2, '0')}`;
        const congesJour = conges.filter(c => {
            const debut = new Date(c.debut);
            const fin = new Date(c.fin);
            const dateCourante = new Date(dateStr);
            return dateCourante >= debut && dateCourante <= fin;
        });
        
        calendrierHTML += `<div class="jour">`;
        calendrierHTML += `<div class="numero-jour">${jour}</div>`;
        
        congesJour.forEach(c => {
            calendrierHTML += `<div class="conge-item" title="${c.personne}">${c.personne}</div>`;
        });
        
        calendrierHTML += `</div>`;
    }
    
    document.getElementById('calendrier').innerHTML = calendrierHTML;
}

function changerMois() {
    afficherCalendrier();
}

function ajouterConges() {
    const personne = document.getElementById('personne').value;
    const dateDebut = document.getElementById('dateDebut').value;
    const dateFin = document.getElementById('dateFin').value;
    
    if (!dateDebut || !dateFin) {
        alert('Veuillez sélectionner les dates de début et de fin');
        return;
    }
    
    if (new Date(dateDebut) > new Date(dateFin)) {
        alert('La date de début doit être antérieure à la date de fin');
        return;
    }
    
    conges.push({
        id: Date.now(),
        personne: personne,
        debut: dateDebut,
        fin: dateFin
    });
    
    // Trier les congés par date
    conges.sort((a, b) => new Date(a.debut) - new Date(b.debut));
    
    afficherCalendrier();
    
    // Sauvegarde locale automatique
    localStorage.setItem('conges', JSON.stringify(conges));
    
    // Afficher les instructions GitHub
    afficherInstructionsGit();
    
    // Réinitialiser les champs
    document.getElementById('dateDebut').value = '';
    document.getElementById('dateFin').value = '';
}

function afficherInstructionsGit() {
    const instructions = document.getElementById('githubInstructions');
    if (instructions) {
        instructions.innerHTML = `
            <div class="github-instructions">
                <h4>📤 Pour partager sur GitHub :</h4>
                <ol>
                    <li>Téléchargez le fichier <button onclick="sauvegarderJSON()">📥 conges.json</button></li>
                    <li>Allez sur votre repo GitHub</li>
                    <li>Naviguez vers <code>data/conges.json</code></li>
                    <li>Cliquez sur "Edit" (✏️)</li>
                    <li>Remplacez le contenu par le nouveau fichier</li>
                    <li>Committez les changements</li>
                </ol>
                <p class="note">Note: Les autres devront recharger la page après votre mise à jour.</p>
            </div>
        `;
    }
}

function sauvegarderJSON() {
    const dataStr = JSON.stringify(conges, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conges.json';
    a.click();
    URL.revokeObjectURL(url);
}

async function chargerDepuisGitHub() {
    try {
        // Construction de l'URL GitHub raw
        const url = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/data/conges.json`;
        
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            conges = data;
            document.getElementById('status').innerHTML = '✅ Données chargées depuis GitHub';
        } else {
            // Fallback sur localStorage ou données par défaut
            const saved = localStorage.getItem('conges');
            if (saved) {
                conges = JSON.parse(saved);
                document.getElementById('status').innerHTML = '⚠️ Données chargées depuis le cache local';
            } else {
                conges = [];
                document.getElementById('status').innerHTML = 'ℹ️ Aucune donnée trouvée';
            }
        }
        
        afficherCalendrier();
    } catch (error) {
        console.error('Erreur:', error);
        // Fallback sur localStorage
        const saved = localStorage.getItem('conges');
        if (saved) {
            conges = JSON.parse(saved);
            document.getElementById('status').innerHTML = '⚠️ Mode hors-ligne - données locales';
        } else {
            conges = [];
            document.getElementById('status').innerHTML = '❌ Erreur de chargement';
        }
        afficherCalendrier();
    }
}

function rafraichirDepuisGitHub() {
    chargerDepuisGitHub();
}
