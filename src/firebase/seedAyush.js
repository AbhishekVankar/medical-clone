/**
 * seedAyush.js
 *
 * Seeds the `inventory` collection with 147 Ayurvedic medicines from NLEAM.
 *
 * Visit /seed and click "Seed Ayurvedic Medicines" to run.
 * Pass force=true to delete existing ayurvedic docs first.
 */

import { collection, addDoc, getDocs, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

const AYURVEDIC_MEDICINES = [
  { name: 'Abhayarishta', packSize: '200 ml', category: 'Asava Arista', indications: 'Arsha, Agnimandya, Udararoga, Vibandha', dose: '12-24 ml', precautions: '' },
  { name: 'Amritarishta', packSize: '200 ml', category: 'Asava Arista', indications: 'SarvaJvara, Jirna Jvara', dose: '12-24 ml', precautions: '' },
  { name: 'Aragvadharishta', packSize: '200 ml', category: 'Asava Arista', indications: 'Kandu, Tvak Vikara, Vibandha Balaroga,', dose: '12-24 ml', precautions: '' },
  { name: 'Aravindasava', packSize: '200 ml 200 ml', category: 'Asava Arista', indications: 'Balakshaya, Agnimandya, Aruchi Hridroga, Hriddrava, Hrid-daurbalya,', dose: 'ml 12-24', precautions: '' },
  { name: 'Ashokarishta', packSize: '200 ml', category: 'Asava Arista', indications: 'Moha, Murchha Asrigdara, Shveta Pradara, Yoniroga Murchha, Apasmara,', dose: '12-24 ml', precautions: '' },
  { name: 'Ashvagandha- rishta', packSize: '200 ml', category: 'Asava Arista', indications: 'Shosha, Unmada, Karshya Daurbalya,Vataroga,', dose: 'ml 12-24', precautions: '' },
  { name: 'Balarishta', packSize: '200 ml', category: 'Asava Arista', indications: 'Agnimandya, Karshya Shukrameha,', dose: 'ml 12-24', precautions: '' },
  { name: 'Chandanasava', packSize: '200 ml', category: 'Asava Arista', indications: 'Mutrakriccha, Hridroga Vata Vyadhi,', dose: 'ml 12-24', precautions: '' },
  { name: 'Dashamularishta', packSize: '200 ml', category: 'Asava Arista', indications: 'Daurbalya, Prasavottara roga Aruchi, Hridroga,', dose: 'ml 12-24', precautions: '' },
  { name: 'Drakshasava', packSize: '200 ml 200 ml', category: 'Asava Arista', indications: 'Pandu Duarbalya, Kshaya Agnimandya, Kasa, Shvasa, Urahkshata, Kshaya,', dose: '12-24 ml', precautions: '' },
  { name: 'Jirakadyarishta', packSize: '200 ml', category: 'Asava Arista', indications: 'Sutikaroga, Agnimandya, Atisara,Grahaniroga Kasa, Shvasa,', dose: '24 ml', precautions: '' },
  { name: 'Kanakasava', packSize: '200 ml 200 ml', category: 'Asava Arista', indications: 'Rajayakshma, Kshatakshina Rajodushti, Krichhrartav,', dose: 'ml 12-24', precautions: '' },
  { name: 'Kumaryasava', packSize: '200 ml', category: 'Asava Arista', indications: 'Paktishula, Parinamashula, Grahaniroga¸ Pravahika,', dose: 'ml 12-24', precautions: '' },
  { name: 'Khadirarishta', packSize: '200 ml', category: 'Asava Arista', indications: 'Raktatisara, Agnimandya Tvak Roga, Kushtha, Krimi, Arbuda Prameha,', dose: '12-24 ml', precautions: '' },
  { name: 'Lodhrasava/ Rodhrasava', packSize: '200 ml', category: 'Asava Arista', indications: 'Pradara, Arsha Garbhasayaroga, Pandu, Kamala,', dose: 'ml 12-24', precautions: '' },
  { name: 'Lohasava', packSize: '200 ml', category: 'Asava Arista', indications: 'Shotha, Hridroga, Daurbalya Agnimandya,', dose: 'ml 12-24', precautions: '' },
  { name: 'Mustakarishta', packSize: '200 ml', category: 'Asava Arista', indications: 'Ajirna, Grahaniroga, Visuchika Grahaniroga,', dose: 'ml 12-24', precautions: '' },
  { name: 'Pippalyadyasava', packSize: '200 ml', category: 'Asava Arista', indications: 'Agnimandya, Gulma, Udararoga,', dose: 'ml', precautions: '' },
  { name: 'Rohitakarishta', packSize: '200 ml 200 ml', category: 'Asava Arista', indications: 'Pliha, Udararoga, Gulma, Kamala Apasmara, Manasa Dosha,', dose: '12-24 ml', precautions: '' },
  { name: 'Vasakasava', packSize: '200 ml', category: 'Asava Arista', indications: 'Kasa, Shvasa, Raktapitta Shotha, Pliha-', dose: '12-24 ml', precautions: '' },
  { name: 'Punarnavasava', packSize: 'Pack Size', category: 'Asava Arista', indications: 'Main Indications', dose: 'Dose', precautions: 'Precaution/ Contraindi - cation' },
  { name: 'Arka Yavani/ Arka Ajvayana', packSize: '50 ml', category: 'Asava Arista', indications: 'Trikshula, Agnimandya, Anaha, Mandagni,', dose: '10-25 ml', precautions: '' },
  { name: 'Arka Shatpushpa/ Mishr eyarka', packSize: '50 ml', category: 'Asava Arista', indications: 'Adhamana, Shula, Krimi,Yonishula Chhardi, Ajirna,', dose: 'ml 10-25', precautions: '' },
  { name: 'Arka Pudina', packSize: 'Pack Size', category: 'Asava Arista', indications: 'Main Indications', dose: 'Dose', precautions: 'Precaution/ Contraindi - cation' },
  { name: 'Agastya Haritaki/ Agastya Rasayana', packSize: '100 gm 100 gm', category: 'Asava Arista', indications: 'Hikka, Kasa, Shvasa, Rasayana Jirna Pravahika, Aruchi, Agnimandya,', dose: '5-15 gm', precautions: '' },
  { name: 'Chyavanprash Avaleha', packSize: '100 gm', category: 'Chyavanprash Avaleha', indications: 'Kasa,Shvasa, Rasayana Pandu, Kamala,', dose: '12-24 gm', precautions: '' },
  { name: 'Drakshavaleha', packSize: '100 gm 100 gm', category: 'Chyavanprash Avaleha', indications: 'Halimaka, Daurbalya, Kshaya Shitapitta, Kandu Visphota, Dadru,', dose: '6-12 gm', precautions: '' },
  { name: 'Kutajavaleha', packSize: '100 gm', category: 'Kutajavaleha', indications: 'Udarda, Kotha Atisara, Grahaniroga, Pravahika', dose: '12 gm', precautions: '' },
  { name: 'Kalyanak Guda', packSize: '100 gm', category: 'Kutajavaleha', indications: 'Udararoga, Gulma, Bhagandar, Arsha Hikka, Kasa, Shvasa,', dose: '6-12 gm', precautions: '' },
  { name: 'Kantakarya- valeha', packSize: '100 gm 100 gm', category: 'Kutajavaleha', indications: 'Jirna Pratishaya, Parshvashula Kasa, Shvasa, Urahkshata,', dose: '6-12 gm', precautions: '' },
  { name: 'Kushmandaka Rasayana', packSize: '100 gm', category: 'Kutajavaleha', indications: 'Kshaya, Raktapitta, Amlapitta Vandhyaroga, Pradara, Somaroga,', dose: '6-12 gm', precautions: '' },
  { name: 'Puga Khanda/ Supari Paka', packSize: '100 gm', category: 'Kutajavaleha', indications: 'Garbhadosha, Daurbalya Prasavottara Lakshana,', dose: '10-50', precautions: '' },
  { name: 'Saubhagya- shunthi Paka', packSize: '100 gm', category: 'Kutajavaleha', indications: 'Sutikaroga, Agnimandya, Rajodosha, Yonidosha,', dose: 'gm 6 -12', precautions: '' },
  { name: 'Vasavaleha', packSize: '100 gm', category: 'Vasavaleha', indications: 'Kasa , Shvasa, Jvara, Parshvashula Kasa, Shvasa,', dose: '6-12 gm', precautions: 'Pregnancy' },
  { name: 'Vyaghri Haritaki', packSize: 'Pack Size', category: 'Vasavaleha', indications: 'Main Indications', dose: 'Dose', precautions: 'Precaution/ Contraindi - cation' },
  { name: 'Dashamula Kvatha Churna', packSize: '100 gm', category: 'Dashamula Kvatha Churna', indications: 'Pratisyaya Jvara, Sutikadosha, Shula, Shotha, Vatavyadhi Kasa,Parshva shula,', dose: '25-50 ml', precautions: '' },
  { name: 'Dashmula Katutraya Kvatha Churna', packSize: '100 gm', category: 'Dashamula Kvatha Churna', indications: 'Vataroga Amashula,', dose: 'ml 25-50', precautions: '' },
  { name: 'Dhanyapanchaka Kashaya Churna', packSize: '100 gm', category: 'Dashamula Kvatha Churna', indications: 'Amatisara, Agnimandya, Aruchi', dose: 'ml', precautions: '' },
  { name: 'Guduchyadi Kashaya Churna', packSize: '100 gm', category: 'Dashamula Kvatha Churna', indications: 'Agnimandhya, Pitta Dushti, Jvara', dose: '25-50 ml', precautions: '' },
  { name: 'Indukantam Kashayam Churna', packSize: '100 gm 100 gm', category: 'Dashamula Kvatha Churna', indications: 'Vata Roga,Kshaya Vranashotha, Upadan sha, Shveta Pradara', dose: '25-50 ml', precautions: '' },
  { name: 'Pathyadi Kvatha (Shadanga) Churna', packSize: '100 gm', category: 'Dashamula Kvatha Churna', indications: 'Suryavarta Kamala, Pandu', dose: '25-50 ml', precautions: 'Chhardi, Atisara, Ativirechan janya Rasakshaya, Vataprakopa' },
  { name: 'Phalatrikadi Kvatha Churna', packSize: '100 gm', category: 'Dashamula Kvatha Churna', indications: 'Janghashula, Urushula, Parshvashula, Trikshula,', dose: '25-50 ml', precautions: 'Concomit- ant use of Eranda Taila in Garbhini' },
  { name: 'Rasnasaptaka Kashaya Churna', packSize: '100', category: 'Dashamula Kvatha Churna', indications: 'Prishashula Trishna,Jvara', dose: '25-50', precautions: 'Nausea due to' },
  { name: 'Trinapanchamula Kvatha Churna', packSize: '100 gm 100 gm', category: 'Trinapanchamula Kvatha Churna', indications: 'Mutrakricchra Ashmari,', dose: '25-50 ml', precautions: '' },
  { name: 'Varunadi Kvatha Churna', packSize: '100 gm', category: 'Trinapanchamula Kvatha Churna', indications: 'Mutrasthila Pandu, Raktapitta', dose: '25-50 ml', precautions: '' },
  { name: 'Amritadi Guggulu', packSize: '10 gm 10 gm', category: 'Amritadi Guggulu', indications: 'Vata Rakta, Dushtavrana, Prameha, Mutrakricchra,', dose: '500 mg', precautions: 'use in pregnancy Long term use in' },
  { name: 'Gokshuradi Guggulu', packSize: '10 gm', category: 'Amritadi Guggulu', indications: 'Mutraghata, Ashmari, Pradara Galaganda, Gandamala, Apachi,', dose: '1gm', precautions: 'pregnancy Long term use in' },
  { name: 'Kaishora Guggulu', packSize: '10 gm', category: 'Kaishora Guggulu', indications: 'Arbuda, Granthi Vatashonita, Pramehapidika, Vrana, Kustha Asthibhagna,', dose: '1gm', precautions: 'use in pregnancy Long term' },
  { name: 'Lakshadi Guggulu', packSize: '10 gm', category: 'Kaishora Guggulu', indications: 'Asthichyuti, Asthiruja Sthaulya, Sandhigata', dose: '500 mg', precautions: 'use in pregnancy Long term' },
  { name: 'Navak Guggulu', packSize: '10 gm', category: 'Kaishora Guggulu', indications: 'Vata', dose: '1gm', precautions: 'use in pregnancy Long term' },
  { name: 'Rasna Guggulu', packSize: '10 gm 10 gm', category: 'Kaishora Guggulu', indications: 'Gridhrasi, Amavata Amavata, Vatarakta, Sandhi Shula,', dose: '1 gm', precautions: 'use in pregnancy Pregnancy' },
  { name: 'Simhanada Guggulu', packSize: '10 gm', category: 'Kaishora Guggulu', indications: 'Agnimandya Parshvashula,Kasa', dose: '3 gm', precautions: 'Pregnancy' },
  { name: 'Saptavinshati Guggulu', packSize: '10 gm', category: 'Kaishora Guggulu', indications: 'Shvasa, Hritshula Bhagandara, Arsha, Nadi Vrana, Gulma,', dose: '3 gm', precautions: 'Pregnancy Chronic or' },
  { name: 'Trayodashanga Guggulu', packSize: '10 gm', category: 'Kaishora Guggulu', indications: 'Katigraha Vatarakta, Vriddhiroga,', dose: '3 gm', precautions: 'Pregnancy' },
  { name: 'Punarnava Guggulu', packSize: '10 gm', category: 'Kaishora Guggulu', indications: 'Gridhrasi,Vastigatas hula, Amavata Amavata, Agnimandya,', dose: '3 gm', precautions: 'Pregnancy' },
  { name: 'Yogaraja Guggulu', packSize: 'Pack Size', category: 'Kaishora Guggulu', indications: 'Main Indications', dose: 'Dose', precautions: 'Precaution/ Contraindi - cation' },
  { name: 'Brahmi Ghrita', packSize: '100 gm', category: 'Brahmi Ghrita', indications: 'Apasmara, Unmada, Smritikshaya, Budhidaurbalya Pandu,', dose: '15 gm', precautions: '' },
  { name: 'Dadimadi Ghrita', packSize: '100 gm', category: 'Brahmi Ghrita', indications: 'Parinamshula, Agnimandya', dose: 'gm', precautions: '' },
  { name: 'Guggulutiktaka Ghrita', packSize: '100 gm 100 gm', category: 'Brahmi Ghrita', indications: 'Vata Roga Vrana, Dagdha', dose: 'T5o- 1b0e gm applied on affect- ed part', precautions: '' },
  { name: 'Jathyadi Ghrita', packSize: '100 gm', category: 'Brahmi Ghrita', indications: 'Vrana Bhutonmada, Apsmara, Balagraha, Visavikara,', dose: '10-15 gm', precautions: '' },
  { name: 'Panchatikta Ghrita', packSize: '100 gm', category: 'Panchatikta Ghrita', indications: 'Dushtavrana, Tvak Vikara', dose: '5-10 gm', precautions: '' },
  { name: 'Phala Ghrita', packSize: '100 gm', category: 'Panchatikta Ghrita', indications: 'Yonivyapat', dose: '10-15 gm', precautions: '' },
  { name: 'Shatavaryadi Ghrita', packSize: '100 gm 100 gm', category: 'Panchatikta Ghrita', indications: 'Mutraghata Vidvibandha, Udararoga,', dose: '10-15 gm', precautions: '' },
  { name: 'Indu kanta Ghrita', packSize: '100 gm', category: 'Indu kanta Ghrita', indications: 'Gulma, Yonishula, Pliharoga Shula, Udara, Vishama Jvara', dose: '10-15 gm', precautions: '' },
  { name: 'Tiktaka Ghrita', packSize: '100 gm', category: 'Indu kanta Ghrita', indications: 'Tvakroga Kamala, Timira,', dose: '10-15 gm', precautions: '' },
  { name: 'Triphala Ghrita', packSize: 'Pack Size', category: 'Indu kanta Ghrita', indications: 'Main Indications', dose: 'Dose', precautions: 'Precaution/ Contraindi - cation' },
  { name: 'Ajamodadi Churna', packSize: '25 gm', category: 'Ajamodadi Churna', indications: 'Shula, Gridhrasi, Amvata', dose: '3-6 gm', precautions: '' },
  { name: 'Avipattikara Churna', packSize: '50 gm', category: 'Ajamodadi Churna', indications: 'Amlapitta, Vidagdhajirna', dose: '3-6 gm', precautions: '' },
  { name: 'Balachaturbhadra Churna', packSize: '25 gm', category: 'Ajamodadi Churna', indications: 'Jvara, Atisara, Bala Shosha', dose: '500 mg', precautions: '' },
  { name: 'Bilvadi Churna', packSize: '50 gm', category: 'Ajamodadi Churna', indications: 'Shotha,Shula Yukta Bradhna', dose: '3-6 gm', precautions: '' },
  { name: 'Dadimastak Churna', packSize: '50 gm', category: 'Ajamodadi Churna', indications: 'Grahaniroga, Atisara, Aruchi Mukha Roga, Danta', dose: '3-6 gm', precautions: '' },
  { name: 'Eladi Churna', packSize: '25 gm', category: 'Eladi Churna', indications: 'Kasa, Shvasa', dose: '4 gm', precautions: '' },
  { name: 'Hingvashtaka Churna', packSize: '50 gm 50 gm', category: 'Eladi Churna', indications: 'Agnimandya, Shula, Gulma,Vataroga Agnimandya, Gulma, Ajirna,', dose: '4 gm', precautions: 'NS Shotha, Jalodara, hyperten' },
  { name: 'Nisha-Amalaki Churna', packSize: '50 gm', category: 'Nisha-Amalaki Churna', indications: 'Grahaniroga, Vatakaphajaroga, Prameha, Madhumeha Raktapradara,', dose: '3-6 gm', precautions: '' },
  { name: 'Pushyanuga Churna', packSize: '25 gm', category: 'Nisha-Amalaki Churna', indications: 'Shwetapradara, Raktarsha Kshudrakushtha,', dose: '2-3 gm', precautions: '' },
  { name: 'Panchanimba Churna', packSize: '25 gm', category: 'Nisha-Amalaki Churna', indications: 'Mahakushtha, Raktadushti Shvasa, Kasa,', dose: '5 gm', precautions: '' },
  { name: 'Sitopaladi Churna', packSize: '25 gm', category: 'Nisha-Amalaki Churna', indications: 'Kshaya, Urdhvaga Raktapitta Kasa, Shvasa,', dose: '2-3gm', precautions: '' },
  { name: 'Talishadya Churna', packSize: '25 gm 25 gm', category: 'Nisha-Amalaki Churna', indications: 'Pratishyaya, Jvara Arochaka, Ama, Agnimandya', dose: '2-4 gm', precautions: 'NS Paittika Vikara or Prakriti, Raktaj Roga, pregnancy,' },
  { name: 'Trikatu Churna', packSize: '50 gm', category: 'Nisha-Amalaki Churna', indications: 'Anaha, Prameha,', dose: '3-6 gm', precautions: 'long term use Dehydra-' },
  { name: 'Amalaki Churna', packSize: '50 gm', category: 'Amalaki Churna', indications: 'Prameha, Raktapitta, Amlapitta,Daha', dose: '6 gm', precautions: '' },
  { name: 'Arjuna Churna', packSize: '50 gm 50 gm', category: 'Amalaki Churna', indications: 'Hridroga, Prameha Kshaya, Daurbalya,', dose: '6 gm', precautions: 'NLoSng term use may increase blood pressure' },
  { name: 'Gokshura Churna', packSize: '50 gm', category: 'Gokshura Churna', indications: 'Vatroga,Klaivya Mutraghata, Mutrashmari,', dose: '5 gm', precautions: '' },
  { name: 'Guduchi Churna', packSize: '50 gm 50 gm', category: 'Gokshura Churna', indications: 'Vrishya, Rasayana Kushtha, Vibandha,', dose: '6 gm', precautions: 'Debility, NS pregnancy, dehydration, Paittika Roga' },
  { name: 'Pippali Churna', packSize: '25 gm', category: 'Pippali Churna', indications: 'Udararoga Rasayana, Jvara, Shvasa, Kasa', dose: '1-2 gm', precautions: '' },
  { name: 'Pippali mula Churna', packSize: '25 gm', category: 'Pippali Churna', indications: 'Udararoga, Anaha, Gulma, Shiroroga', dose: '500 mg', precautions: '' },
  { name: 'Punarnava Churna', packSize: '50 gm', category: 'Pippali Churna', indications: 'Shotha, Pandu Amavata,', dose: '2-3 gm', precautions: '' },
  { name: 'Shunthi Churna', packSize: '25 gm', category: 'Pippali Churna', indications: 'Agnimandya Udararoga,Shvasa', dose: '3 gm', precautions: '' },
  { name: 'Sarasvata Churna', packSize: '25 gm 25 gm', category: 'Pippali Churna', indications: 'Medhya, Smriti and Buddhi Vardhaka Malabandha,', dose: '2 gm', precautions: 'NDeShydrat ion, malnutrit ion, long term use' },
  { name: 'Yashtimadhu/ Madhuyashti/ Yashti Churna', packSize: 'Pack Size', category: 'Vidanga Churna', indications: 'Main Indications', dose: 'Dose', precautions: 'Precaution/ Contraindi - cation' },
  { name: 'Anutaila', packSize: '10 ml', category: 'Anutaila', indications: 'Urdhvajatru- gataroga, Palitya Badhirya, Karnanada, Karnagutha', dose: '2-10 drops', precautions: '' },
  { name: 'Apamargkshara Taila', packSize: '10 ml', category: 'Anutaila', indications: 'Kshata,Kshaya, Vatavyadhi, Shosha, Gulma', dose: 'each ear For', precautions: '' },
  { name: 'Bala Taila', packSize: '50 ml', category: 'Anutaila', indications: 'Balaroga', dose: 'Abhyanga', precautions: '' },
  { name: 'Balashvagand- hadi Taila', packSize: '50 ml 50 ml', category: 'Anutaila', indications: 'Keshapata, Shiroroga, Khalitya, Indralupta', dose: 'For Jwara For Nasya, Shiro- abhyanga, Kavalgraha', precautions: '' },
  { name: 'Bhringaraja Tail', packSize: '10 ml', category: 'Anutaila', indications: 'Vataroga, Pakshavadha, Dhatukshaya, Sutikaroga, Balaroga', dose: '10-30 drops', precautions: 'Amadosha' },
  { name: 'Dhanvantar Taila/Dhanvantar Taila Avarti', packSize: '50 ml', category: 'Anutaila', indications: 'Vatavikara, Gridhrasi, Vibandha, Katishula', dose: '10-30 ml', precautions: 'Peri- conception period, long term use in pregnancy' },
  { name: 'Gandharvahasta Taila', packSize: '50 ml', category: 'Gandharvahasta Taila', indications: 'Dantaroga Vidradhi, Udara, Mahavataroga, Gulma, Udavarta', dose: '6-12 ml', precautions: 'Amavast ha' },
  { name: 'Jatyadi Taila', packSize: '25 ml 50 ml', category: 'Gandharvahasta Taila', indications: 'Vrana, Vranashotha Vatarakta, Vataroga,', dose: '10-12 ml', precautions: '' },
  { name: 'Kottamachukkadi Taila', packSize: '50 ml', category: 'Kottamachukkadi Taila', indications: 'Sukradosha, Rajodosha, Karshya Vataroga, Amavata, Angasthambha', dose: 'Abhyanga and Nasya For Abhyanga', precautions: '' },
  { name: 'Karpuradi Taila', packSize: '50 ml', category: 'Kottamachukkadi Taila', indications: 'Khalli, Angavedana, Sandhivedana', dose: 'For Abhyanga External', precautions: '' },
  { name: 'Kasisadi Taila', packSize: '25 ml', category: 'Kottamachukkadi Taila', indications: 'Arsha', dose: 'use for Arshankura', precautions: '' },
  { name: 'Laghuvishagar- bha Taila', packSize: '50 ml', category: 'Kottamachukkadi Taila', indications: 'Vataroga, Pakshaghat,', dose: 'For Abhyanga', precautions: '' },
  { name: 'Marichyadi Taila', packSize: '25 ml', category: 'Kottamachukkadi Taila', indications: 'Kandu, Vicharchika Vataroga,', dose: 'Application on affected part For Abhyanga, Nasya,', precautions: '' },
  { name: 'Mahanarayan Taila', packSize: '50 ml 50 ml', category: 'Kottamachukkadi Taila', indications: 'Pakshaghata, Ardita, Vandhyatva Ardita , Shirokampa, Vidradhi,', dose: 'Anuvasana Vasti For Abhyanga', precautions: '' },
  { name: 'Murivenna Tail', packSize: '50 ml 50 ml', category: 'Kottamachukkadi Taila', indications: 'Bahushosha, Avabahuka Abhighataja Vedana and Vata Vikara Vataroga, Pangu, Shirogatavata,', dose: '6 gm', precautions: '' },
  { name: 'Nalpamaradi Taila', packSize: '25 ml 25 ml', category: 'Nalpamaradi Taila', indications: 'Tvakroga, Kushta, Pama, Kandu Nadivrana, Pama, Apachi, Gandamala,', dose: '30 ml', precautions: '' },
  { name: 'Nirgundi Taila', packSize: '50 ml', category: 'Nalpamaradi Taila', indications: 'Galaganda Sandhigatvata,', dose: 'For Abhyanga, wound dressing Karnapurana or Karnab', precautions: '' },
  { name: 'Pinda Taila', packSize: '50 ml 50 ml', category: 'Pinda Taila', indications: 'Karnashula,Vrana Vataraktaruja, Daha Vataroga,Gridhrasi, Khanja, Panguvata', dose: 'Used externally for Abhyanga For Abhyanga over aff', precautions: 'NNoSt to be used in Guda roga, Krisha rogi, Ajirna, Vamit, Kritnasya, Virikta' },
  { name: 'Prasarini Taila', packSize: '50 ml', category: 'Pinda Taila', indications: 'Vatavyadhi, Kampa, Unmada, Pinasa,', dose: '6-12 ml', precautions: '' },
  { name: 'Saindhavadi Taila', packSize: '50 ml 10 ml', category: 'Saindhavadi Taila', indications: 'Yoniroga, Akshepa Kaphavataja Nadivrana, Drishtidaurbalya, Keshashata,', dose: 'For Abhyanga For Nasya, Kavalgraha, Abhyanga, Shir', precautions: '' },
  { name: 'Shadabindu Taila', packSize: '25 ml', category: 'Saindhavadi Taila', indications: 'Shiroroga, Shvitra, Kushtha', dose: 'For local application on affected body part', precautions: 'Discontinue if excessive irritation, vescication, extensive hyperpig - mentation appears' },
  { name: 'Apamarga Kshar', packSize: '10 gm', category: 'Saindhavadi Taila', indications: 'Gulma, Grahani, Shvasa, Sharkara, Ashmari Adhamana,', dose: '125-500 mg', precautions: '' },
  { name: 'Yavakshar', packSize: '10 gm 30 cm thread of 20 No', category: 'Saindhavadi Taila', indications: 'Anaha, Gulma, Mutrakricchra Bhagandara, Arsha, Nadivrana,', dose: 'gm To be applied on', precautions: '' },
  { name: 'Ksharsutra', packSize: 'Pack Size', category: 'Saindhavadi Taila', indications: 'Main Indications', dose: 'Dose', precautions: 'Precaution/ Contraindi - cation' },
  { name: 'Dashanga Lepa', packSize: '25gm', category: 'Saindhavadi Taila', indications: 'Agnidagdha', dose: 'part To apply on affected', precautions: '' },
  { name: 'Shveta Malaham', packSize: '25 gm', category: 'Saindhavadi Taila', indications: 'Dushta Vrana, Arsha, Gudapaka,', dose: 'part To apply on affected', precautions: '' },
  { name: 'Abhayadi Modakam', packSize: '20 gm', category: 'Saindhavadi Taila', indications: 'Malabandha', dose: '2-4 modakam', precautions: '' },
  { name: 'Bilvadi Gutika', packSize: '5 gm 5 gm', category: 'Saindhavadi Taila', indications: 'Vishuchika, Ajirna, Prameha, Garadosha, Jvara Mutrakricchra, Mutraghata, Ashmari, Striroga, Daurbalya, Pandu, Kamala', dose: '250 mg', precautions: '' },
  { name: 'Chandraprabha Vati', packSize: '5 gm', category: 'Saindhavadi Taila', indications: 'Agnimandya, Amadosha, Grahaniroga', dose: '500 mg', precautions: 'Pregnancy, Uterine bleeding, Pitta Prakriti, Raktpittaj Roga, long term use' },
  { name: 'Chitrakadi Gutika', packSize: '5 gm', category: 'Saindhavadi Taila', indications: 'Kasa, Shvasa, Hridroga,', dose: '250 -500', precautions: '' },
  { name: 'Dhanvantar Gutika', packSize: '10 gm', category: 'Saindhavadi Taila', indications: 'Yakshma,Hikka Kasa, Shvasa, Chhardi, Bhrama,', dose: '500 mg', precautions: '' },
  { name: 'Kankayan Gutika', packSize: '10 gm 10 gm', category: 'Saindhavadi Taila', indications: 'Svarabheda, Raktanishthivana Gulma, Krimi, Arsha Mukhdaurgandhya, Mukhapaka,', dose: '500 mg', precautions: '' },
  { name: 'Kutajaghan Vati', packSize: '5 gm', category: 'Kutajaghan Vati', indications: 'Dantaroga, Galaroga Atisara, Grahani, Jvaratisara', dose: '500 mg', precautions: '' },
  { name: 'Prabhakara Vati', packSize: '5 gm 5 gm', category: 'Prabhakara Vati', indications: 'Atisara Hridroga, Daurbalya Rajorodha, Kastartava', dose: '1 gm', precautions: 'NPrSegnancy, lactation, excessive Uterine Bleeding, kidney disease, discontinue in case of severe abdominal pain' },
  { name: 'Samshamani Vati / Guduchighana Vati', packSize: '5 gm 5 gm', category: 'Samshamani Vati / Guduchighana Vati', indications: 'Jvara, Jirna Jvara, Vishma Jvara, Daha Anidra, Manodvega', dose: '250-500 mg', precautions: 'NCoSncomitant use of medicines made of Vatsanabha or Gokshuru, anti hyperten sives/ depressants/ psychotropic medicines postural hypotension, bradycardia' },
  { name: 'Sarpagandha- ghana Vati', packSize: '5 gm', category: 'Samshamani Vati / Guduchighana Vati', indications: 'Mandagni, Ajirna, Gulma, Visuchika, Sarpadamsha', dose: '125 mg', precautions: 'Pitta Prakriti individuals, hyper sensitivity to Bhallataka, patients having history of Raktapittaja Vikara, pregnancy, cardiac arrhythmia, long term use' },
  { name: 'Nalikeranjana', packSize: 'Pack Size', category: 'Samshamani Vati / Guduchighana Vati', indications: 'Main Indications', dose: 'Dose', precautions: 'Precaution/ Contraindi - cation' },
  { name: 'Guduchi Sattva', packSize: 'Pack Size', category: 'Samshamani Vati / Guduchighana Vati', indications: 'Main Indications', dose: 'Dose', precautions: 'Precaution/ Contraindi - cation' },
  { name: 'Akika Pishti', packSize: '5 gm', category: 'Samshamani Vati / Guduchighana Vati', indications: 'Hriddaha, Hridroga, Kshaya, Shiroroga, Kasa,', dose: '250 mg', precautions: '' },
  { name: 'Mukta Pishti', packSize: '2 gm', category: 'Samshamani Vati / Guduchighana Vati', indications: 'Manodosha, Unmada, Hridroga Kasa, Pittaroga,', dose: '65-125 mg', precautions: '' },
  { name: 'Pravala Pishti', packSize: 'Pack Size', category: 'Samshamani Vati / Guduchighana Vati', indications: 'Main Indications', dose: 'Dose', precautions: 'Precaution/ Contraindi - cation' },
  { name: 'Jaharamohara Bhasma', packSize: '5 gm 5 gm', category: 'Jaharamohara Bhasma', indications: 'Daha Hridroga, Raktapitta, Arsha, Raktaj Pravahika Parinamashula, Agnimandya, Karnasrava', dose: '500 mg', precautions: 'NS Not to be used on change of physical' },
  { name: 'Mandur Bhasma', packSize: '5 gm 5 gm', category: 'Mandur Bhasma', indications: 'Kamala, Pandu Udarashula,Jvara, Pitta Jvara,', dose: '250-500 mg', precautions: '' },
  { name: 'Shankha Bhasma', packSize: '5 gm', category: 'Mandur Bhasma', indications: 'Vidagdhajirna, Parinamashula, Jvara, Kaphaja Vrana, Shvitra, Visarpa,, Raktasrava,', dose: '125-250 mg', precautions: '' },
  { name: 'Sphatika Bhasma', packSize: '5 mg', category: 'Mandur Bhasma', indications: 'Yonibhransha Kasa, Shvasa', dose: '125 - 250', precautions: '' },
  { name: 'Tankana Bhas- ma/ Saubhagya Bhasma', packSize: 'Pack Size', category: 'Mandur Bhasma', indications: 'Main Indications', dose: 'Dose', precautions: 'Precaution/ Contraindi - cation' },
  { name: 'Arsho Kuthara Rasa', packSize: '5 gm 5 gm', category: 'Mandur Bhasma', indications: 'Arsha Bhrama, Manoroga, Aptantrak, Akshepa,', dose: '250 mg', precautions: '' },
  { name: 'Brahmi Vati', packSize: '5 gm', category: 'Mandur Bhasma', indications: 'Hriddaurbalya Kushta, Raktadushti,', dose: '250-500', precautions: 'Hyperse nsitivity,' },
  { name: 'Gandhak Rasayana', packSize: '5 gm', category: 'Mandur Bhasma', indications: 'Prameha Amlapitta, Raktapitta, Daha,', dose: 'mg 125-250', precautions: 'loose motions NS' },
  { name: 'Kamadudha Rasa', packSize: '5 gm', category: 'Mandur Bhasma', indications: 'JirnaJvara, Pradara Kshaya, Yakshma, Pradara, Netraroga,', dose: '250 mg', precautions: 'Kidney disease, long term' },
  { name: 'Laghumalini Vasanta Rasa', packSize: '5 gm', category: 'Mandur Bhasma', indications: 'Arsha, JirnaJvara Pittaja Shirahshula, Ardhavbhedaka, Suryavarta, Daha, Urdhvaga', dose: '500mg', precautions: 'use Long term use, pregnancy lactation period, paediatric age group' },
  { name: 'Navajivana Rasa', packSize: '5 gm', category: 'Mandur Bhasma', indications: 'Shulahara Grahani, Atisara, Amajirna, Visuchika, Shula', dose: '250-500 mg', precautions: 'Kidney disease, bradycardia, arrhythmia, hypotension, long term use, peri- conceptional period period, pregnancy, lactating mothers and debilitate patients' },
  { name: 'Shankha Vati', packSize: '5 gm', category: 'Mandur Bhasma', indications: 'Shirahshula, Shiroroga', dose: '250-500 mg', precautions: 'Kidney disease, bradycardia, arrhythmia, hypotension, long term use, peri- conceptional period period, pregnancy, lactating mothers and debilitate patients' },
  { name: 'Shirahshuladi vajra Rasa', packSize: '5 gm', category: 'Mandur Bhasma', indications: 'Kasa, Shvasa, Vatakaphaja Roga', dose: '125-250 mg', precautions: 'Kidney disease, bradycardia, arrhythmia, hypotension, long term use, peri- conceptional period period, pregnancy, lactating mothers and debilitate patients' },
  { name: 'Tribhuvankirti Rasa', packSize: '5 gm', category: 'Mandur Bhasma', indications: 'Vata Roga, Avabahuka, Urustambha, Pakshaghata, Gridhrasi', dose: '250 mg', precautions: 'Long term use, Vrikka Roga, peri- concepti onal period, pregnancy, lactation and debilitate patients' },
  { name: 'Vatagajankusha Rasa', packSize: '5 gm', category: 'Mandur Bhasma', indications: 'Vatajashula, Sutika', dose: '250 mg', precautions: '' },
  { name: 'Vatavidhavansan Rasa', packSize: 'Pack Size', category: 'Mandur Bhasma', indications: 'Main Indications', dose: 'Dose', precautions: 'Precaution/ Contraindi - cation' },
  { name: 'Navayasa Lauha', packSize: '5 gm 5 gm', category: 'Navayasa Lauha', indications: 'Pandu, Kamala, Hridroga Timira,', dose: '250 mg', precautions: '' }
];

export async function seedAyush(force = false) {
  const col = collection(db, 'inventory');

  if (!force) {
    const existing = await getDocs(query(col, where('type', '==', 'ayurvedic')));
    if (!existing.empty) {
      return { skipped: true, count: existing.size };
    }
  } else {
    const existing = await getDocs(query(col, where('type', '==', 'ayurvedic')));
    await Promise.all(existing.docs.map(d => deleteDoc(d.ref)));
  }

  const CHUNK = 50;
  let inserted = 0;

  for (let i = 0; i < AYURVEDIC_MEDICINES.length; i += CHUNK) {
    const chunk = AYURVEDIC_MEDICINES.slice(i, i + CHUNK);
    await Promise.all(chunk.map(m =>
      addDoc(col, {
        medicineName: m.name,
        type: 'ayurvedic',
        drugCode: '',
        unitSize: m.packSize,
        price: 0,
        formulation: 'Classical Formulation',
        category: m.category,
        sideEffects: m.precautions ? [m.precautions] : [],
        stockQuantity: 0,
        indications: m.indications
          ? m.indications.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        dose: m.dose,
        precautions: m.precautions,
        createdAt: serverTimestamp(),
      })
    ));
    inserted += chunk.length;
  }

  return { inserted };
}
