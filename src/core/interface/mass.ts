export interface IMass {
  informations: Information;
  messes: Mass[];
}

interface Mass {
  nom: string;
  lectures: Reading[];
}

interface Reading {
  type: ReadingType;
  titre: string;
  contenu: InnerHTML;
  ref: string;
  intro_lue: string;
  verset_evangile: InnerHTML;
  ref_verset: string;
}

interface Information {
  date: string;
  zone: string;
  couleur: string;
  annee: string;
  temps_liturgique: string;
  semaine: string;
  jour: string;
  jour_liturgique_nom: string;
  fete: string;
  degre: string;
  ligne1: string;
  ligne2: string;
  ligne3: string;
}

type ReadingType = 'evangile' | 'psaume';
