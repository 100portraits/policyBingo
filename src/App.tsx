import { useState } from "react"
import { BingoSquare } from "./components/bingoSquare"
import { sendRequest } from "./services/llmService"
import type { BingoItem } from "./types/models"

function App() {

  const [userText, setUserText] = useState("")

  const bingoItems = [
    {
      id: 1,
      value: "AUTO",
      keywords: ["car", "vehicle", "voertuig", "automobiel", "wagen"],
      isMatched: false
    },
    {
      id: 2, 
      value: "DIGITALISERING",
      keywords: ["digital", "digitization", "digital transformation", "digitale transformatie", "automatisering"],
      isMatched: false
    },
    {
      id: 3,
      value: "ELEKTRISCH",
      keywords: ["electric", "electrical", "elektriciteit", "elektrische auto", "ev"],
      isMatched: false
    },
    {
      id: 4,
      value: "SYSTEEM",
      keywords: ["system", "framework", "structure", "raamwerk", "structuur"],
      isMatched: false
    },
    {
      id: 5,
      value: "VAN A NAAR B",
      keywords: ["from a to b", "transport", "journey", "reis", "verplaatsing"],
      isMatched: false
    },
    {
      id: 6,
      value: "EFFICIENT",
      keywords: ["efficiency", "effective", "optimized", "efficiënt", "doelmatig"],
      isMatched: false
    },
    {
      id: 7,
      value: "VERKEERS VEILIGHEID",
      keywords: ["traffic safety", "road safety", "safe driving", "veilig verkeer", "verkeersveilig"],
      isMatched: false
    },
    {
      id: 8,
      value: "LAAD INFRASTRUCTUUR",
      keywords: ["charging infrastructure", "ev charging", "laadpaal", "laadstation", "oplaadpunt"],
      isMatched: false
    },
    {
      id: 9,
      value: "FILES",
      keywords: ["traffic jam", "congestion", "verkeersopstopping", "opstopping", "drukte"],
      isMatched: false
    },
    {
      id: 10,
      value: "DOOR FIETS ROUTE",
      keywords: ["bicycle route", "bike path", "cycling route", "fietspad", "fietsroute"],
      isMatched: false
    },
    {
      id: 11,
      value: "DUURZAAM",
      keywords: ["sustainable", "eco-friendly", "green", "milieuvriendelijk", "ecologisch"],
      isMatched: false
    },
    {
      id: 12,
      value: "PARKEER VERGUNNING",
      keywords: ["parking permit", "parking license", "parkeerplaats", "parkeren", "vergunning"],
      isMatched: false
    },
    {
      id: 13,
      value: "LAB",
      keywords: [],
      isMatched: true
    },
    {
      id: 14,
      value: "REIS TIJD WINST",
      keywords: ["travel time gain", "time saving", "faster journey", "tijdwinst", "snellere reis"],
      isMatched: false
    },
    {
      id: 15,
      value: "MAKKELIJK",
      keywords: ["easy", "simple", "convenient", "eenvoudig", "gemakkelijk"],
      isMatched: false
    },
    {
      id: 16,
      value: "ZELF RIJDEND",
      keywords: ["self-driving", "autonomous", "automated", "autonoom", "zelfrijdend"],
      isMatched: false
    },
    {
      id: 17,
      value: "DOOR STROMING",
      keywords: ["flow", "traffic flow", "circulation", "verkeersstroom", "doorstroom"],
      isMatched: false
    },
    {
      id: 18,
      value: "SNEL",
      keywords: ["fast", "quick", "rapid", "vlug", "rap"],
      isMatched: false
    },
    {
      id: 19,
      value: "OPENBAAR VERVOER",
      keywords: ["public transport", "public transit", "bus", "train", "ov"],
      isMatched: false
    },
    {
      id: 20,
      value: "WOON WERK VERKEER",
      keywords: ["commute", "commuter traffic", "rush hour", "forens", "spitsuur"],
      isMatched: false
    },
    {
      id: 21,
      value: "OPTIMALISATIE",
      keywords: ["optimization", "improvement", "enhancement", "verbetering", "optimaliseren"],
      isMatched: false
    },
    {
      id: 22,
      value: "PARKEER DRUK",
      keywords: ["parking pressure", "parking demand", "parking shortage", "parkeertekort", "parkeerprobleem"],
      isMatched: false
    },
    {
      id: 23,
      value: "E-BIKE/ FATBIKE",
      keywords: ["electric bike", "electric bicycle", "fat tire bike", "elektrische fiets", "pedelec"],
      isMatched: false
    },
    {
      id: 24,
      value: "VERKEER",
      keywords: ["traffic", "transport", "transportation", "vervoer", "mobiliteit"],
      isMatched: false
    },
    {
      id: 25,
      value: "BETAALD PARKEREN",
      keywords: ["paid parking", "parking fee", "parking charge", "parkeergeld", "parkeerkosten"],
      isMatched: false
    }
  ]

  const [bingoBoard, setBingoBoard] = useState<BingoItem[]>(bingoItems)

  const handleGenerate = async () => {
    const response = await sendRequest({
      userText: userText,
      bingoItems: bingoItems
    })
    const matchesList = response.results.matchedItems
    matchesList.push(13)
    setBingoBoard(bingoBoard.map(item => ({ ...item, isMatched: matchesList.includes(item.id) })))
  }

  return (
    <div className="bg-zinc-200 min-h-screen w-full flex justify-center gap-20 items-center">
      <div className="flex flex-col gap-4 w-1/3">
        <textarea className="w-full p-4 min-h-30  rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your platform here..." value={userText} onChange={(e) => setUserText(e.target.value)} />
        <button className="w-full p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 transition-colors" onClick={handleGenerate}>Generate</button>
      </div>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-5 gap-4">
          {bingoBoard.map((item, index) => (
            <BingoSquare key={item.id} item={item} isMatched={item.isMatched || false} alternate={index % 2 === 1} />
          ))}

        </div>
      </div>
    </div>
  )
}

export default App
