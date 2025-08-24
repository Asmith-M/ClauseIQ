"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import Navbar from "@/components/Navbar"
import PDFUpload from "@/components/PDFUpload"
import ClauseCard from "@/components/ClauseCard"
import EmptyState from "@/components/EmptyState"

export default function Home({ darkMode, toggleDarkMode }) {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [clauses, setClauses] = useState([])
  const [aiResults, setAiResults] = useState({})
  const [aiLoading, setAiLoading] = useState({})

  // Scroll to top on entering Home
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setUploadedFile(file)
      setIsAnalyzing(true)
      setShowResults(false)
      setClauses([])
      setAiResults({})
      setAiLoading({})
      try {
        const formData = new FormData()
        formData.append("file", file)
        const response = await fetch("/api/extract-clauses/", {
          method: "POST",
          body: formData,
        })
        if (!response.ok) throw new Error("Failed to extract clauses")
        const data = await response.json()
        const extractedClauses = data.clauses || []
        setClauses(extractedClauses)
        setShowResults(true)
        // Auto-analyze all clauses with staggered async calls
        const delay = (ms) => new Promise((res) => setTimeout(res, ms))
        extractedClauses.forEach(async (clause, idx) => {
          setAiLoading((prev) => ({ ...prev, [idx]: true }))
          await delay(idx * 350) // stagger requests by 350ms each
          try {
            const resp = await fetch("/api/analyze-clause/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ clause }),
            })
            if (!resp.ok) throw new Error("AI analysis failed")
            const result = await resp.json()
            setAiResults((prev) => ({ ...prev, [idx]: result }))
          } catch (err) {
            setAiResults((prev) => ({ ...prev, [idx]: { error: err.message } }))
          } finally {
            setAiLoading((prev) => ({ ...prev, [idx]: false }))
          }
        })
      } catch (err) {
        alert("Error extracting clauses: " + err.message)
      } finally {
        setIsAnalyzing(false)
      }
    }
  }

  const handleSmartExplain = async (clause, index) => {
    setAiLoading((prev) => ({ ...prev, [index]: true }))
    try {
      const response = await fetch("/api/analyze-clause/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clause }),
      })
      if (!response.ok) throw new Error("AI analysis failed")
      const data = await response.json()
      setAiResults((prev) => ({ ...prev, [index]: data }))
    } catch (err) {
      setAiResults((prev) => ({ ...prev, [index]: { error: err.message } }))
    } finally {
      setAiLoading((prev) => ({ ...prev, [index]: false }))
    }
  }

  const handleSelectDocument = async (doc) => {
    setSelectedDocument(doc)
    setShowResults(false)
    setUploadedFile(null)
    setIsAnalyzing(true)
    setClauses([])
    setAiResults({})
    setAiLoading({})
    try {
      const response = await fetch(\`/api/documents/\${doc.id}/clauses/\`)
      if (!response.ok) throw new Error("Failed to fetch clauses for document")
      const data = await response.json()
      const fetchedClauses = data.map(c => c.text)
      setClauses(fetchedClauses)
      setShowResults(true)
    } catch (err) {
      alert("Error fetching clauses: " + err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950 transition-colors flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(!sidebarOpen)}
        darkMode={darkMode}
        selectedDocument={selectedDocument}
        onSelectDocument={handleSelectDocument}
        onHome={() => {
          setSelectedDocument(null)
          setShowResults(false)
          setUploadedFile(null)
          setIsAnalyzing(false)
        }}
        onToggleDarkMode={toggleDarkMode}
      />
      <div className="flex-1 flex flex-col bg-white/95 dark:bg-gray-900/95 min-h-screen">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            {!selectedDocument && (
              <PDFUpload
                uploadedFile={uploadedFile}
                isAnalyzing={isAnalyzing}
                onFileUpload={handleFileUpload}
              />
            )}
            {(showResults || selectedDocument) && (
              <div className="space-y-6">
                {clauses.map((clause, index) => (
                  <ClauseCard
                    key={index}
                    index={index}
                    clause={clause}
                    aiResult={aiResults[index]}
                    aiLoading={aiLoading[index]}
                    onSmartExplain={handleSmartExplain}
                  />
                ))}
              </div>
            )}
            {!showResults && !isAnalyzing && !uploadedFile && !selectedDocument && <EmptyState />}
          </div>
        </main>
      </div>
    </div>
  )
}
