<?php

namespace Database\Seeders;

use App\Models\ArchivePhoto;
use App\Models\ArticlePresse;
use App\Models\Badge;
use App\Models\ContenuFormation;
use App\Models\Defi;
use App\Models\Evenement;
use App\Models\Idee;
use App\Models\Membre;
use App\Models\MessageLivreOr;
use App\Models\PresentationMouvement;
use App\Models\Publication;
use App\Models\Quartier;
use App\Models\Realisation;
use App\Models\Sondage;
use App\Models\TemoignageAncien;
use App\Models\TemoignageMembre;
use App\Models\Video;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Jeu de données de démonstration pour tester la partie publique
     * (web/) en conditions réalistes. À exécuter après QuartierSeeder et
     * BadgeSeeder : `php artisan db:seed --class=DemoDataSeeder`.
     *
     * Les URLs de photos utilisent picsum.photos (images de substitution
     * publiques) en attendant le vrai stockage médias (Étape 0).
     */
    public function run(): void
    {
        $quartiers = Quartier::pluck('id', 'nom');
        $badgeNouveauMembre = Badge::orderBy('ordre')->first();
        $badgeActif = Badge::orderBy('ordre')->skip(1)->first();

        // --- Membres ---------------------------------------------------
        $noms = [
            ['nom' => 'Ibrahima Sow', 'quartier' => 'Quartier Centre', 'role' => 'ambassadeur'],
            ['nom' => 'Aissatou Ba', 'quartier' => 'Quartier Nord', 'role' => 'ambassadeur'],
            ['nom' => 'Modou Gueye', 'quartier' => 'Quartier Sud', 'role' => 'ambassadeur'],
            ['nom' => 'Khady Diouf', 'quartier' => 'Quartier Centre', 'role' => 'membre'],
            ['nom' => 'Cheikh Ndour', 'quartier' => 'Quartier Est', 'role' => 'membre'],
            ['nom' => 'Mariama Cissokho', 'quartier' => 'Quartier Ouest', 'role' => 'membre'],
            ['nom' => 'Abdoulaye Faye', 'quartier' => 'Quartier Centre', 'role' => 'membre'],
            ['nom' => 'Ndeye Fatou Seck', 'quartier' => 'Quartier Nord', 'role' => 'membre'],
            ['nom' => 'Oumar Kane', 'quartier' => 'Quartier Sud', 'role' => 'membre'],
            ['nom' => 'Bineta Sarr', 'quartier' => 'Quartier Est', 'role' => 'membre'],
            ['nom' => 'Lamine Thiam', 'quartier' => 'Quartier Ouest', 'role' => 'membre'],
            ['nom' => 'Sokhna Wade', 'quartier' => 'Quartier Centre', 'role' => 'membre'],
            ['nom' => 'Pape Amadou Dia', 'quartier' => 'Quartier Nord', 'role' => 'membre'],
            ['nom' => 'Astou Mbaye', 'quartier' => 'Quartier Sud', 'role' => 'membre'],
        ];

        $membres = [];
        $ambassadeurs = [];

        foreach ($noms as $i => $data) {
            $telephone = '76'.str_pad((string) (100000 + $i), 7, '0', STR_PAD_LEFT);

            $membre = Membre::firstOrCreate(
                ['telephone' => $telephone],
                [
                    'numero_carte' => 'TEMP',
                    'nom' => $data['nom'],
                    'password' => Hash::make('password'),
                    'quartier_id' => $quartiers[$data['quartier']],
                    'role' => $data['role'],
                    'langue_preferee' => 'fr',
                    'date_adhesion' => now()->subDays(random_int(0, 21))->setTime(random_int(8, 19), random_int(0, 59)),
                    'consentement_donnees' => true,
                    'consentement_donnees_at' => now(),
                ]
            );

            if ($membre->numero_carte === 'TEMP') {
                $membre->update(['numero_carte' => 'TD-'.str_pad((string) $membre->id, 6, '0', STR_PAD_LEFT)]);
            }

            if ($badgeNouveauMembre && ! $membre->badges()->where('badge_id', $badgeNouveauMembre->id)->exists()) {
                $membre->badges()->attach($badgeNouveauMembre->id, ['obtenu_at' => $membre->date_adhesion]);
            }
            if ($badgeActif && random_int(0, 1) === 1 && ! $membre->badges()->where('badge_id', $badgeActif->id)->exists()) {
                $membre->badges()->attach($badgeActif->id, ['obtenu_at' => now()]);
            }

            $membres[] = $membre;
            if ($data['role'] === 'ambassadeur') {
                $ambassadeurs[] = $membre;
            }
        }

        // Parrainage : quelques membres recrutés par des ambassadeurs
        foreach (array_slice($membres, 3, 6) as $i => $membre) {
            $membre->update(['parraine_par_id' => $ambassadeurs[$i % count($ambassadeurs)]->id]);
        }

        // --- Sondages ----------------------------------------------------
        $sondage1 = Sondage::firstOrCreate(
            ['question' => 'Faut-il prioriser la réfection de la route du marché central ?'],
            ['actif' => true]
        );
        if ($sondage1->options()->count() === 0) {
            $optOui = $sondage1->options()->create(['texte' => 'Oui, en priorité']);
            $optNon = $sondage1->options()->create(['texte' => 'Non, autre chose est plus urgent']);
            foreach (array_slice($membres, 0, 9) as $i => $membre) {
                $sondage1->votes()->create([
                    'option_sondage_id' => $i % 3 === 0 ? $optNon->id : $optOui->id,
                    'membre_id' => $membre->id,
                ]);
            }
        }

        $sondage2 = Sondage::firstOrCreate(
            ['question' => 'Quel projet devrait être lancé en premier ?'],
            ['actif' => true]
        );
        if ($sondage2->options()->count() === 0) {
            $optEcole = $sondage2->options()->create(['texte' => 'Rénovation de l\'école']);
            $optEau = $sondage2->options()->create(['texte' => "Réseau d'adduction d'eau"]);
            $optEclairage = $sondage2->options()->create(['texte' => 'Éclairage public']);
            foreach (array_slice($membres, 2, 8) as $i => $membre) {
                $options = [$optEcole->id, $optEau->id, $optEclairage->id];
                $sondage2->votes()->create([
                    'option_sondage_id' => $options[$i % 3],
                    'membre_id' => $membre->id,
                ]);
            }
        }

        // --- Idées -------------------------------------------------------
        $idees = [
            ['titre' => "Marché couvert pour la saison des pluies", 'statut' => 'approuvee'],
            ['titre' => 'Terrain multisport pour les jeunes', 'statut' => 'approuvee'],
            ['titre' => 'Point de collecte de déchets par quartier', 'statut' => 'approuvee'],
            ['titre' => 'Éclairage solaire autour de la mosquée', 'statut' => 'en_attente'],
            ['titre' => 'Ligne de transport vers M\'bour', 'statut' => 'rejetee'],
        ];
        foreach ($idees as $i => $data) {
            $idee = Idee::firstOrCreate(
                ['titre' => $data['titre']],
                [
                    'membre_id' => $membres[$i % count($membres)]->id,
                    'description' => "Proposition soumise par un membre du mouvement pour améliorer le quotidien à Thiadiaye.",
                    'statut' => $data['statut'],
                ]
            );
            if ($data['statut'] === 'approuvee' && $idee->votants()->count() === 0) {
                foreach (array_slice($membres, 0, random_int(3, 10)) as $membre) {
                    $idee->votants()->syncWithoutDetaching([$membre->id]);
                }
            }
        }

        // --- Vidéos --------------------------------------------------------
        $videos = [
            ['titre' => "Message d'El Hadj Omar Youm à la population", 'type' => 'message'],
            ['titre' => 'Pourquoi je soutiens Thiadiaye Debout', 'type' => 'temoignage'],
            ['titre' => 'Réfection de la piste de Quartier Nord', 'type' => 'realisation'],
            ['titre' => 'Replay : réunion publique du 1er septembre', 'type' => 'replay'],
        ];
        foreach ($videos as $i => $data) {
            Video::firstOrCreate(
                ['titre' => $data['titre']],
                [
                    'description' => 'Vidéo de démonstration pour la plateforme Thiadiaye Debout.',
                    'type' => $data['type'],
                    'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    'quartier_id' => $quartiers->values()[$i % $quartiers->count()],
                    'statut' => 'publiee',
                ]
            );
        }

        // --- Gamification : défis -----------------------------------------
        Defi::firstOrCreate(
            ['titre' => 'Atteignons 50 membres avant la fin du mois !'],
            [
                'description' => 'Objectif collectif de mobilisation pour tout le mouvement.',
                'objectif_membres' => 50,
                'date_limite' => now()->addDays(20),
                'actif' => true,
            ]
        );

        // --- Mémoire de Thiadiaye -------------------------------------------
        $photos = [
            ['titre' => 'Le marché de Thiadiaye en 2012', 'annee' => 2012],
            ['titre' => 'La route principale avant réfection', 'annee' => 2015],
            ['titre' => "L'école primaire en 2018", 'annee' => 2018],
            ['titre' => 'Thiadiaye aujourd\'hui', 'annee' => 2026],
        ];
        foreach ($photos as $i => $data) {
            ArchivePhoto::firstOrCreate(
                ['titre' => $data['titre']],
                [
                    'description' => 'Photo d\'archive de démonstration.',
                    'url' => "https://picsum.photos/seed/thiadiaye{$i}/800/600",
                    'annee' => $data['annee'],
                ]
            );
        }

        $temoignagesAnciens = [
            ['auteur' => 'Doyen Serigne Mbaye', 'contenu' => "Thiadiaye n'était qu'un petit village de pêcheurs et d'agriculteurs. Voir aujourd'hui ces routes et ces écoles, c'est une fierté immense."],
            ['auteur' => 'Doyenne Aminata Fall', 'contenu' => "Nous marchions des kilomètres pour aller chercher de l'eau. Les jeunes d'aujourd'hui ne connaissent pas cette réalité, et c'est tant mieux."],
            ['auteur' => 'Doyen El Hadj Malick Diagne', 'contenu' => 'Le marché central a été construit à la force des bras du village. Aujourd\'hui il accueille tout le département.'],
        ];
        foreach ($temoignagesAnciens as $data) {
            TemoignageAncien::firstOrCreate(
                ['auteur_nom' => $data['auteur']],
                ['contenu' => $data['contenu'], 'statut' => 'publie']
            );
        }

        $messagesLivreOr = [
            ['auteur' => 'Fatou D.', 'message' => 'Fière d\'être de Thiadiaye. Que le mouvement continue !'],
            ['auteur' => 'Serigne T.', 'message' => 'Bravo pour cette plateforme, on se sent enfin écoutés.'],
            ['auteur' => 'Aicha N.', 'message' => 'Thiadiaye Debout, pour toujours.'],
        ];
        foreach ($messagesLivreOr as $data) {
            MessageLivreOr::firstOrCreate(
                ['auteur_nom' => $data['auteur']],
                ['message' => $data['message'], 'statut' => 'publie']
            );
        }

        // --- Journal du mouvement -------------------------------------------
        $publications = [
            ['titre' => 'Ouverture officielle de la plateforme Thiadiaye Debout', 'type' => 'actualite', 'jours' => 12],
            ['titre' => 'Réunion publique : bilan des 6 derniers mois', 'type' => 'actualite', 'jours' => 8],
            ['titre' => 'Lancement de la campagne de reboisement', 'type' => 'actualite', 'jours' => 4],
            ['titre' => 'Bilan 2025 : ce qui a été accompli pour Thiadiaye', 'type' => 'bilan', 'jours' => 15],
        ];
        foreach ($publications as $data) {
            Publication::firstOrCreate(
                ['titre' => $data['titre']],
                [
                    'contenu' => "Le mouvement Thiadiaye Debout poursuit son engagement aux côtés de la population. Plus de détails seront communiqués lors des prochaines réunions de quartier.",
                    'type' => $data['type'],
                    'statut' => 'publiee',
                    'publie_at' => now()->subDays($data['jours']),
                ]
            );
        }

        // --- Réalisations ---------------------------------------------------
        $realisations = [
            ['titre' => 'Réfection de la voirie du marché', 'quartier' => 'Quartier Centre'],
            ['titre' => "Extension du réseau d'eau potable", 'quartier' => 'Quartier Nord'],
            ['titre' => 'Construction de deux salles de classe', 'quartier' => 'Quartier Sud'],
            ['titre' => 'Éclairage public solaire', 'quartier' => 'Quartier Est'],
        ];
        foreach ($realisations as $i => $data) {
            Realisation::firstOrCreate(
                ['titre' => $data['titre']],
                [
                    'description' => 'Projet réalisé grâce à la mobilisation du mouvement et de la population.',
                    'quartier_id' => $quartiers[$data['quartier']],
                    'photo_avant_url' => "https://picsum.photos/seed/avant{$i}/600/400",
                    'photo_apres_url' => "https://picsum.photos/seed/apres{$i}/600/400",
                    'date_realisation' => now()->subMonths(random_int(1, 12)),
                ]
            );
        }

        // --- Témoignage de la semaine -----------------------------------
        TemoignageMembre::firstOrCreate(
            ['membre_id' => $membres[0]->id],
            [
                'contenu' => "Je soutiens Thiadiaye Debout parce que j'ai vu de mes propres yeux les routes et les écoles se transformer. C'est notre avenir qui se construit.",
                'statut' => 'publie',
                'mis_en_avant_le' => now()->toDateString(),
            ]
        );

        // --- Agenda citoyen ---------------------------------------------
        $evenements = [
            [
                'titre' => 'Réunion publique de Quartier Centre',
                'lieu' => 'Place du marché',
                'quartier' => 'Quartier Centre',
                'lat' => 14.4021, 'lng' => -16.8991,
                'debut' => now()->addDays(5)->setTime(17, 0),
                'reserve' => false,
            ],
            [
                'titre' => 'Journée de reboisement citoyen',
                'lieu' => 'École primaire de Quartier Nord',
                'quartier' => 'Quartier Nord',
                'lat' => 14.4085, 'lng' => -16.9032,
                'debut' => now()->addDays(9)->setTime(9, 0),
                'reserve' => false,
            ],
            [
                'titre' => 'Réunion mensuelle des ambassadeurs',
                'lieu' => 'En ligne',
                'quartier' => null,
                'lat' => null, 'lng' => null,
                'debut' => now()->addDays(3)->setTime(20, 0),
                'reserve' => true,
            ],
        ];
        foreach ($evenements as $data) {
            $evenement = Evenement::firstOrCreate(
                ['titre' => $data['titre']],
                [
                    'description' => 'Événement de mobilisation organisé par le mouvement Thiadiaye Debout.',
                    'lieu' => $data['lieu'],
                    'quartier_id' => $data['quartier'] ? $quartiers[$data['quartier']] : null,
                    'latitude' => $data['lat'],
                    'longitude' => $data['lng'],
                    'debut_at' => $data['debut'],
                    'lien_reunion' => $data['reserve'] ? 'https://meet.google.com/demo-lien' : null,
                    'reserve_ambassadeurs' => $data['reserve'],
                ]
            );

            if (! $data['reserve'] && $evenement->inscriptions()->count() === 0) {
                foreach (array_slice($membres, 0, random_int(3, 7)) as $membre) {
                    $evenement->inscriptions()->firstOrCreate(['membre_id' => $membre->id]);
                }
            }
        }

        // --- Formation ambassadeurs ---------------------------------------
        $formations = [
            ['titre' => 'Bien accueillir un nouveau membre', 'contenu' => 'Comment présenter le mouvement et répondre aux premières questions.'],
            ['titre' => 'Utiliser son lien de parrainage', 'contenu' => "Partagez votre lien personnel sur WhatsApp pour suivre vos recrutements."],
        ];
        foreach ($formations as $i => $data) {
            ContenuFormation::firstOrCreate(
                ['titre' => $data['titre']],
                ['contenu' => $data['contenu'], 'ordre' => $i]
            );
        }

        // --- Revue de presse -------------------------------------------
        $articlesPresse = [
            ['titre' => 'Thiadiaye Debout : un mouvement citoyen qui monte en puissance', 'source' => 'Le Soleil', 'jours' => 6],
            ['titre' => 'El Hadj Omar Youm mobilise la jeunesse de Thiadiaye', 'source' => 'APS', 'jours' => 14],
            ['titre' => "Développement local : l'exemple de Thiadiaye salué", 'source' => 'Sud Quotidien', 'jours' => 22],
        ];
        foreach ($articlesPresse as $i => $data) {
            ArticlePresse::firstOrCreate(
                ['titre' => $data['titre']],
                [
                    'source' => $data['source'],
                    'lien' => 'https://www.lesoleil.sn',
                    'image_url' => "https://picsum.photos/seed/presse{$i}/600/400",
                    'date_publication' => now()->subDays($data['jours']),
                ]
            );
        }

        // --- Présentation du mouvement (accueil public) --------------------
        $presentation = PresentationMouvement::firstOrCreate([]);
        if (! $presentation->description) {
            $presentation->update([
                'description' => "Thiadiaye Debout est un mouvement citoyen qui rassemble les habitants de Thiadiaye autour d'un projet commun de développement local : infrastructures, éducation, accès à l'eau et mobilisation de proximité. Porté par la participation de chaque quartier, il agit pour une ville plus forte et plus unie.",
                'president_nom' => 'El Hadj Omar Youm',
                'president_titre' => 'Président du mouvement',
                'president_bio' => "Engagé depuis de nombreuses années aux côtés de la population de Thiadiaye, El Hadj Omar Youm fédère les quartiers autour d'une vision commune de développement et de solidarité. Il porte la voix du mouvement auprès des autorités et sur le terrain, aux côtés des ambassadeurs et des membres.",
                'president_photo_url' => 'https://picsum.photos/seed/president-thiadiaye/500/500',
            ]);
        }
    }
}
