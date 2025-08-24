import React, { useState, useEffect } from "react"
import {
  Home,
  FileText,
  Download,
  Trash2,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
  History,
  Sun,
  Moon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const RISK_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  NONE: "none",
}

const STATUS_TYPES = {
  ANALYZED: "analyzed",
  ANALYZING: "analyzing",
}

const Sidebar = ({
  isOpen,
  onClose,
  darkMode,
  selectedDocument,
  onSelectDocument,
  onHome,
  onToggleDarkMode,
}) => {
  const getRiskBadgeColor = (riskLevel) => {
    switch (riskLevel) {
      case RISK_LEVELS.LOW:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case RISK_LEVELS.MEDIUM:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case RISK_LEVELS.HIGH:
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case STATUS_TYPES.ANALYZED:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case STATUS_TYPES.ANALYZING:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  const [documentHistory, setDocumentHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDocuments() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/documents/")
        if (!response.ok) {
          throw new Error("Failed to fetch documents")
        }
        const data = await response.json()
        const docs = data.map((doc) => {
          const riskLevelsMap = { low: 1, medium: 2, high: 3 }
          const maxRiskNumeric = doc.clauses.reduce((maxRisk, clause) => {
            const clauseRisk = riskLevelsMap[clause.risk?.toLowerCase()] || 0
            return clauseRisk > maxRisk ? clauseRisk : maxRisk
          }, 0)

          const riskLevelStr = [RISK_LEVELS.NONE, RISK_LEVELS.LOW, RISK_LEVELS.MEDIUM, RISK_LEVELS.HIGH]
          const calculatedRiskLevel = riskLevelStr[maxRiskNumeric] || RISK_LEVELS.NONE

          return {
            id: doc.id,
            name: doc.filename,
            uploadDate: new Date(doc.upload_time).toLocaleDateString(),
            status: STATUS_TYPES.ANALYZED, // Assuming all fetched docs are analyzed
            clauses: doc.clauses.length,
            riskLevel: calculatedRiskLevel,
            size: "N/A", // Placeholder: Consider fetching actual size
          }
        })
        setDocumentHistory(docs)
      } catch (err) {
        console.error("Error fetching documents:", err)
        setError("Failed to load documents. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    if (isOpen) {
      fetchDocuments()
    }
  }, [isOpen])

  // TODO: Implement actual download logic
  const handleDownload = (docId) => {
    console.log(`Downloading document with ID: ${docId}`)
    // Example: window.open(`/api/documents/${docId}/download`, '_blank');
  }

  // TODO: Implement actual delete logic with confirmation
  const handleDelete = (docId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      console.log(`Deleting document with ID: ${docId}`)
      // Example: fetch(`/api/documents/${docId}`, { method: 'DELETE' }).then(...)
    }
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

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
          <div className="flex items-center justify-between p-4 border-b border-blue-700 dark:border-gray-800">
            {isOpen ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white tracking-wide text-lg">
                      ClauseIQ
                    </h2>
                    <p className="text-xs text-blue-100/80">Legal Assistant</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="lg:hidden text-white hover:bg-blue-700/30 dark:hover:bg-gray-800"
                  aria-label="Close sidebar"
                >
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

          <div className="p-2 border-b border-blue-700 dark:border-gray-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={onHome}
              className={`w-full justify-${isOpen ? "start" : "center"} text-white hover:bg-blue-700/30 dark:hover:bg-gray-800 gap-2`}
              aria-label="Go to Home"
            >
              <Home className="h-4 w-4" />
              {isOpen && "Home"}
            </Button>
          </div>

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

          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="p-4 text-center text-blue-100">Loading documents...</div>
            )}
            {error && (
              <div className="p-4 text-center text-red-300">{error}</div>
            )}
            {!isLoading && !error && (
              <>
                {isOpen ? (
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <History className="h-4 w-4 text-blue-100/80" /> {/* Changed color for consistency */}
                      <h3 className="text-sm font-semibold text-white">Document History</h3> {/* Changed color for consistency */}
                    </div>
                    <div className="space-y-3">
                      {documentHistory.length === 0 ? (
                        <p className="text-blue-100/80 text-sm">No documents found.</p>
                      ) : (
                        documentHistory.map((doc) => (
                          <div
                            key={doc.id}
                            onClick={() => onSelectDocument(doc)}
                            className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 group
                              ${selectedDocument?.id === doc.id
                                ? "bg-gradient-to-r from-blue-400 to-indigo-500 text-white border-2 border-blue-300 shadow-lg shadow-blue-500/30"
                                : "bg-white/10 dark:bg-gray-900/40 hover:bg-blue-700/30 dark:hover:bg-gray-800 border-2 border-transparent"}
                            `}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                onSelectDocument(doc);
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-white/20 dark:bg-gray-700/50 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
                                <FileText className="h-4 w-4 text-white" /> {/* Changed icon color */}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate" title={doc.name}>
                                  {doc.name}
                                </p>
                                <p className="text-xs text-blue-100/80 mt-1">{doc.uploadDate}</p>
                                <p className="text-xs text-blue-100/80">{doc.size}</p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <Badge className={`text-xs px-2 py-1 ${getStatusBadgeColor(doc.status)}`}>
                                    {doc.status}
                                  </Badge>
                                  <Badge className={`text-xs px-2 py-1 ${getRiskBadgeColor(doc.riskLevel)}`}>
                                    {doc.riskLevel} risk
                                  </Badge>
                                </div>
                                <p className="text-xs text-blue-100/80 mt-1">{doc.clauses} clauses</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleDownload(doc.id); }}
                                className="h-7 px-2 bg-blue-500/30 hover:bg-blue-500/50 dark:bg-gray-700/50 dark:hover:bg-gray-700 text-white"
                                aria-label="Download document"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                                className="h-7 px-2 text-red-300 hover:text-red-400 bg-red-500/30 dark:bg-gray-700/50 dark:hover:bg-gray-700"
                                aria-label="Delete document"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {documentHistory.length === 0 ? (
                      <p className="text-blue-100/80 text-sm text-center">No documents</p>
                    ) : (
                      documentHistory.slice(0, 5).map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => onSelectDocument(doc)}
                          className={`p-2 rounded-lg cursor-pointer transition-all duration-200
                            ${selectedDocument?.id === doc.id
                              ? "bg-gradient-to-r from-blue-400 to-indigo-500 text-white"
                              : "hover:bg-blue-700/30 dark:hover:bg-gray-800 bg-white/10 dark:bg-gray-900/40"}
                          `}
                          title={doc.name}
                          role="button"
                          tabIndex={0}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              onSelectDocument(doc);
                            }
                          }}
                        >
                          <div className="flex justify-center">
                            <FileText className="h-5 w-5 text-white" /> {/* Changed icon color */}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {onToggleDarkMode && (
            <div className="p-4 border-t border-blue-700 dark:border-gray-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleDarkMode}
                className={`w-full justify-${isOpen ? "start" : "center"} text-white hover:bg-blue-700/30 dark:hover:bg-gray-800 gap-2`}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isOpen && (darkMode ? "Light Mode" : "Dark Mode")}
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar