"use client"

import { useState, useEffect } from "react"
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Menu,
  X,
  Moon,
  Sun,
  Sparkles,
  Shield,
  Zap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  History,
  Trash2,
  Download,
  Home,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Sidebar Component
function Sidebar({ isOpen, onClose, darkMode, selectedDocument, onSelectDocument, onHome, onToggleDarkMode, onUploadNew }) {
  const getRiskBadgeColor = (riskLevel) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "analyzed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "analyzing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  const [documentHistory, setDocumentHistory] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch real document history from backend
  useEffect(() => {
    async function fetchDocuments() {
      if (!isOpen) return
      
      setLoading(true)
      try {
        const response = await fetch("/api/documents/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })
        
        if (!response.ok) throw new Error("Failed to fetch documents")
        const data = await response.json()
        
        // Map documents to expected format for UI
        const docs = data.documents?.map((doc) => {
          // Calculate max risk level as a number first
          const maxRiskNumeric = doc.clauses?.reduce((maxRisk, clause) => {
            const riskLevelsMap = { low: 1, medium: 2, high: 3 }
            const clauseRisk = riskLevelsMap[clause.risk?.toLowerCase()] || 0
            return clauseRisk > maxRisk ? clauseRisk : maxRisk
          }, 0) || 0

          // Convert numeric riskLevel back to string
          const riskLevelStr = ["none", "low", "medium", "high"]
          const calculatedRiskLevel = riskLevelStr[maxRiskNumeric] || "none"

          return {
            id: doc.id,
            name: doc.filename || doc.name,
            uploadDate: new Date(doc.upload_time || doc.created_at).toLocaleDateString(),
            status: "analyzed",
            clauses: doc.clauses?.length || 0,
            riskLevel: calculatedRiskLevel,
            size: doc.size || "N/A",
          }
        }) || []
        
        setDocumentHistory(docs)
      } catch (err) {
        console.error("Error fetching documents:", err)
        setDocumentHistory([])
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [isOpen])

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={onClose} aria-hidden="true" />}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full
          ${isOpen ? "w-80" : "w-16"}
          bg-gradient-to-b from-blue-600 via-purple-600 to-indigo-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
          border-r border-blue-700 dark:border-gray-800
          transition-all duration-300 ease-in-out z-50
          shadow-2xl lg:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          lg:relative lg:z-auto
        `}
      >
        <div className="flex flex-col h-full bg-transparent">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-blue-700 dark:border-gray-800">
            {isOpen ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white tracking-wide text-lg">ClauseIQ</h2>
                    <p className="text-xs text-blue-100/80">AI-Powered Legal Clause Analyzer</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden" aria-label="Close sidebar">
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="w-full flex justify-center">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Home Button */}
          {isOpen && (
            <div className="p-2 border-b border-blue-700 dark:border-gray-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={onHome}
                className="w-full justify-start text-white hover:bg-blue-700/30 dark:hover:bg-gray-800 gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </div>
          )}

          {/* Upload New Document Button */}
          {isOpen && (
            <div className="p-2 border-b border-blue-700 dark:border-gray-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={onUploadNew}
                className="w-full justify-start text-white hover:bg-blue-700/30 dark:hover:bg-gray-800 gap-2 bg-blue-600/20"
              >
                <Plus className="h-4 w-4" />
                Upload New PDF
              </Button>
            </div>
          )}

          {/* Toggle Button (Sidebar Collapse/Expand) */}
          <div className="p-2 border-b border-blue-700 dark:border-gray-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-full justify-center hover:bg-blue-700/30 dark:hover:bg-gray-800 text-white"
              aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          {/* Document History */}
          <div className="flex-1 overflow-y-auto">
            {isOpen ? (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <History className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Document History</h3>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                  </div>
                ) : documentHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-blue-100/80 mb-2">No documents yet</p>
                    <p className="text-xs text-blue-100/60">Upload your first PDF to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documentHistory.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => onSelectDocument(doc)}
                        className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 group
                          ${selectedDocument?.id === doc.id
                            ? "bg-gradient-to-r from-blue-400 to-indigo-500 text-white border-2 border-blue-300 shadow-lg"
                            : "bg-white/80 dark:bg-gray-900/80 hover:bg-blue-100 dark:hover:bg-gray-800 border-2 border-transparent"}
                        `}
                        style={{ boxShadow: selectedDocument?.id === doc.id ? '0 4px 24px 0 rgba(59,130,246,0.15)' : undefined }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={doc.name}>
                              {doc.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{doc.uploadDate}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{doc.size}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge className={`text-xs px-2 py-1 ${getStatusBadgeColor(doc.status)}`}>{doc.status}</Badge>
                              <Badge className={`text-xs px-2 py-1 ${getRiskBadgeColor(doc.riskLevel)}`}>{doc.riskLevel} risk</Badge>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{doc.clauses} clauses</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-7 px-2 bg-blue-100 hover:bg-blue-200 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Download document">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-red-500 hover:text-red-600 bg-red-50 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Delete document">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {documentHistory.slice(0, 5).map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => onSelectDocument(doc)}
                    className={`p-2 rounded-lg cursor-pointer transition-all duration-200
                      ${selectedDocument?.id === doc.id
                        ? "bg-gradient-to-r from-blue-400 to-indigo-500 text-white"
                        : "hover:bg-blue-100 dark:hover:bg-gray-800 bg-white/80 dark:bg-gray-900/80"}
                    `}
                    title={doc.name}
                  >
                    <div className="flex justify-center">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {isOpen && (
            <div className="p-4 border-t border-blue-700 dark:border-gray-800">
              <div className="text-xs text-white text-center font-semibold tracking-wide">
                {documentHistory.length} documents analyzed
              </div>
              <div className="text-xs text-blue-100/60 text-center mt-1">
                Developed by Asmith Mahendrakar
              </div>
            </div>
          )}

          {/* Dark Mode Toggle */}
          {isOpen && onToggleDarkMode && (
            <div className="p-4 border-t border-blue-700 dark:border-gray-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleDarkMode}
                className="w-full justify-start text-white hover:bg-blue-700/30 dark:hover:bg-gray-800 gap-2"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {darkMode ? "Light Mode" : "Dark Mode"}
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

// Main App Component
export default function App() {
  const [currentPage, setCurrentPage] = useState("welcome") // "welcome" or "home"
  const [darkMode, setDarkMode] = useState(false)

  // Initialize dark mode
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true"
    setDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem("darkMode", newDarkMode.toString())
    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleGetStarted = () => {
    setCurrentPage("home")
  }

  if (currentPage === "welcome") {
    return <WelcomePage 
      onGetStarted={handleGetStarted} 
      darkMode={darkMode} 
      toggleDarkMode={toggleDarkMode}
    />
  }

  return <HomePage 
    darkMode={darkMode} 
    toggleDarkMode={toggleDarkMode}
  />
}

// Animation delay helpers for staggered effects
const getDelay = (index, base = 0.2) => `${base + index * 0.2}s`;

// Welcome Page Component
function WelcomePage({ onGetStarted, darkMode, toggleDarkMode }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-900 relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59,130,246,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.08) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Animated Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/40 to-purple-400/40 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/40 to-pink-400/40 rounded-full blur-3xl animate-float-slow-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-blue-400/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-green-400/30 to-teal-400/30 rounded-full blur-2xl animate-float-reverse" />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-br from-pink-400/40 to-rose-400/40 rounded-full blur-xl animate-bounce-slow" />
      </div>

      {/* Top Navigation */}
      <div className="absolute top-6 right-8 z-20 flex items-center gap-4">
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDarkMode}
          className="hover:bg-blue-700/20 dark:hover:bg-gray-800 text-blue-700 dark:text-yellow-300"
        >
          {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
        </Button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-5xl mx-auto">
          {/* Logo and Animated Icon */}
          <div className="mb-16 relative animate-scale-in">
            <div className="inline-flex p-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl animate-bounce-slow mb-6 relative">
              <Shield className="h-16 w-16 text-white" />
              {/* Sparkle effects */}
              <div className="absolute -top-2 -right-2 animate-ping">
                <Sparkles className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="absolute -bottom-2 -left-2 animate-ping delay-1000">
                <Sparkles className="h-6 w-6 text-pink-400" />
              </div>
              <div className="absolute top-0 left-0 animate-ping delay-500">
                <Sparkles className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="space-y-8 mb-20">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight animate-slide-up" style={{animationDelay: getDelay(0)}}>
              ClauseIQ
            </h1>
            <p className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 font-light animate-slide-up" style={{animationDelay: getDelay(1)}}>
              AI-Powered Legal Clause Analyzer
            </p>
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{animationDelay: getDelay(2)}}>
              Upload legal PDF documents and get instant AI-based clause analysis, risk detection, and plain-English explanations. Transform complex legal text into actionable intelligence.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {/* Card 1 */}
            <div className="p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20 dark:border-gray-700/20 animate-slide-up" style={{animationDelay: getDelay(3)}}>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-fit mx-auto mb-6 animate-bounce-slow">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI-Powered Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Advanced machine learning algorithms analyze your legal documents with precision and speed, identifying key clauses instantly.
              </p>
            </div>
            {/* Card 2 */}
            <div className="p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20 dark:border-gray-700/20 animate-slide-up" style={{animationDelay: getDelay(4)}}>
              <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-fit mx-auto mb-6 animate-bounce-slow">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Risk Detection</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Automatically identify potential risks and problematic clauses before they become costly legal issues.
              </p>
            </div>
            {/* Card 3 */}
            <div className="p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20 dark:border-gray-700/20 animate-slide-up" style={{animationDelay: getDelay(5)}}>
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl w-fit mx-auto mb-6 animate-bounce-slow">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Smart Explanations</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Get clear, understandable explanations for complex legal terms and clauses in plain English.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 animate-slide-up" style={{animationDelay: getDelay(6)}}>
            <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">10K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Documents Analyzed</div>
            </div>
            <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">99.9%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy Rate</div>
            </div>
            <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">5 Sec</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Analysis</div>
            </div>
            <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">24/7</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">AI Availability</div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="animate-slide-up">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:to-purple-700 text-white px-16 py-8 text-2xl font-semibold rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 animate-[pulse-cta_4.5s_ease-in-out_infinite!important]"
            >
              Let's Get Started
              <ArrowRight className="ml-4 h-8 w-8 transition-transform" />
            </Button>
            <p className="text-gray-500 dark:text-gray-400 mt-8 text-lg">
              Free to try • Secure & Private • Instant AI Analysis
            </p>
            <p className="text-gray-400 dark:text-gray-500 mt-2 text-sm">
              Developed by <span className="font-semibold">Asmith Mahendrakar</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Empty State Component
function EmptyState({ darkMode }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8 relative">
          <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl">
            <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Ready to analyze your first document?
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Upload a PDF document above to get started with AI-powered clause analysis.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-gray-500">
          <Upload className="h-4 w-4" />
          <span>Drag & drop or click to upload</span>
        </div>
      </div>
    </div>
  )
}

// Home Page Component (Main Dashboard)
function HomePage({ darkMode, toggleDarkMode }) {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [clauses, setClauses] = useState([])
  const [aiResults, setAiResults] = useState({})
  const [aiLoading, setAiLoading] = useState({})

  // Scroll to top on entering HomePage
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        formData.append("filename", file.name)
        formData.append("file", file)
        
        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        })
        
        if (!response.ok) throw new Error("Failed to upload and analyze document")
        
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
              headers: { 
                "Content-Type": "application/json"
              },
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
        alert("Error uploading document: " + err.message)
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
        headers: { 
          "Content-Type": "application/json"
        },
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
      const response = await fetch(`/api/documents/${doc.id}/clauses`)
      
      if (!response.ok) throw new Error("Failed to fetch clauses for document")
      const data = await response.json()
      const fetchedClauses = data.clauses?.map(c => c.text || c) || []
      setClauses(fetchedClauses)
      setShowResults(true)
    } catch (err) {
      alert("Error fetching clauses: " + err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleUploadNew = () => {
    setSelectedDocument(null)
    setShowResults(false)
    setUploadedFile(null)
    setIsAnalyzing(false)
    setClauses([])
    setAiResults({})
    setAiLoading({})
    
    // Trigger file input click
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) {
      fileInput.click()
    }
  }

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "medium":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "high":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      case "medium":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
      case "high":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      default:
        return "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950 transition-colors flex">
      {/* Sidebar */}
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
          setClauses([])
          setAiResults({})
          setAiLoading({})
        }}
        onUploadNew={handleUploadNew}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white/95 dark:bg-gray-900/95 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-800 border-b border-blue-700 dark:border-gray-800 shadow-md backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hover:bg-blue-700/20 dark:hover:bg-gray-800 lg:hidden text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-200 via-purple-200 to-indigo-200 bg-clip-text text-transparent leading-tight">
                  {selectedDocument ? selectedDocument.name : "ClauseIQ - Legal Clause Analyzer"}
                </h1>
                <p className="text-sm text-blue-100/80 dark:text-blue-200/80">
                  {selectedDocument
                    ? `${selectedDocument.clauses} clauses • ${selectedDocument.riskLevel} risk`
                    : "AI-powered document analysis"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="hover:bg-blue-700/20 dark:hover:bg-gray-800 text-white"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Upload Section */}
            {!selectedDocument && (
              <Card className="shadow-2xl border-2 border-blue-200 dark:border-blue-900 bg-white/95 dark:bg-gray-800/95 animate-slide-up">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <Upload className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-lg md:text-xl">Upload PDF Document</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-2xl cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="p-6 bg-white dark:bg-gray-700 rounded-3xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 mb-6">
                          <Upload className="w-10 h-10 text-blue-500 dark:text-blue-400 group-hover:text-purple-500 transition-colors" />
                        </div>
                        <p className="mb-2 text-lg font-medium text-gray-600 dark:text-gray-300">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          PDF files only (Max 10MB)
                        </p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".pdf" 
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>

                  {uploadedFile && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl animate-slide-down">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{uploadedFile.name}</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        {isAnalyzing && (
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                            <Badge variant="secondary" className="animate-pulse px-3 py-1">
                              Analyzing...
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Analysis Results */}
            {(showResults || selectedDocument) && (
              <Card className="shadow-2xl border-2 border-green-200 dark:border-green-900 bg-white/95 dark:bg-gray-800/95 animate-slide-up">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-lg md:text-xl">Clause Analysis Results</span>
                    </CardTitle>
                    <Badge variant="outline" className="px-3 py-1">
                      {clauses.length} clauses found
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {clauses.map((clause, index) => {
                      const ai = aiResults[index]
                      return (
                        <div
                          key={index}
                          className="p-6 rounded-2xl border-2 border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-2xl transition-all duration-300 animate-slide-up"
                          style={{ animationDelay: getDelay(index, 0.1) }}
                        >
                          <div className="flex items-start justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-lg text-gray-900 dark:text-white">Clause {index + 1}</h4>
                                <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">Category: <span className="font-semibold">{ai?.category || <span className="italic">(Analyzing...)</span>}</span></p>
                                <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">Risk: {ai?.risk ? (
                                  <Badge variant={ai.risk.toLowerCase() === 'high' ? 'outline' : ai.risk.toLowerCase() === 'medium' ? 'secondary' : 'default'} className={`capitalize ${ai.risk.toLowerCase() === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ai.risk.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>{ai.risk}</Badge>
                                ) : <span className="italic">(Analyzing...)</span>}</p>
                                {ai?.reason && <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">Reason: {ai.reason}</p>}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={aiLoading[index]}
                              onClick={() => handleSmartExplain(clause, index)}
                              className="flex items-center gap-2 shrink-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 px-4 py-2"
                            >
                              {aiLoading[index] ? (
                                <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full inline-block"></span>
                              ) : (
                                <Lightbulb className="h-4 w-4" />
                              )}
                              Smart Explain
                            </Button>
                          </div>

                          <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{clause}</p>
                          </div>

                          <div className="mt-4">
                            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 border border-blue-200/40 dark:border-blue-700/40 p-4 shadow-inner">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-blue-400 dark:text-blue-300" />
                                <span className="font-semibold text-blue-700 dark:text-blue-200 text-sm">AI Explanation</span>
                              </div>
                              <p className="text-gray-800 dark:text-gray-100 text-base leading-relaxed">
                                {aiLoading[index] ? (
                                  <span className="italic flex items-center gap-2">
                                    <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full inline-block"></span>
                                    Analyzing clause...
                                  </span>
                                ) : ai?.explanation ? (
                                  <span>{ai.explanation}</span>
                                ) : (
                                  <span className="italic">Click "Smart Explain" for AI analysis</span>
                                )}
                              </p>
                              {ai?.error && <div className="text-xs text-red-500 mt-2">Error: {ai.error}</div>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!showResults && !isAnalyzing && !uploadedFile && !selectedDocument && (
              <EmptyState darkMode={darkMode} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}