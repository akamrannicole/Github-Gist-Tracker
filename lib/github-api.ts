const GITHUB_API_BASE = "https://api.github.com"

const getDefaultHeaders = (token: string) => ({
  Authorization: `token ${token}`,
  Accept: "application/vnd.github.v3+json",
  "Content-Type": "application/json",
})

export interface GistFile {
  content: string
  filename?: string 
}

export interface CreateGistParams {
  description?: string
  public?: boolean
  files: Record<string, GistFile>
}

export interface UpdateGistParams {
  description?: string
  files?: Record<string, GistFile | null> 
}

export type RequestBody = CreateGistParams | UpdateGistParams | { body: string } | Record<string, unknown> | undefined

export class GitHubApi {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private async request<T>(endpoint: string, method = "GET", body?: RequestBody): Promise<T> {
    const url = `${GITHUB_API_BASE}${endpoint}`
    const headers = getDefaultHeaders(this.token)

    const options: RequestInit = {
      method,
      headers,
    }

    if (body && method !== "GET") {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`GitHub API error (${response.status}): ${errorText}`)
    }

    if (response.status === 204) {
      return {} as T
    }

    return (await response.json()) as T
  }

  async listGists(perPage = 30, page = 1) {
    return this.request(`/gists?per_page=${perPage}&page=${page}`)
  }

  async listPublicGists(perPage = 30, page = 1) {
    return this.request(`/gists/public?per_page=${perPage}&page=${page}`)
  }

  async listStarredGists(perPage = 30, page = 1) {
    return this.request(`/gists/starred?per_page=${perPage}&page=${page}`)
  }

  async getGist(gistId: string) {
    return this.request(`/gists/${gistId}`)
  }

  async createGist(params: CreateGistParams) {
    return this.request("/gists", "POST", params)
  }

  async updateGist(gistId: string, params: UpdateGistParams) {
    return this.request(`/gists/${gistId}`, "PATCH", params)
  }

  async deleteGist(gistId: string) {
    return this.request(`/gists/${gistId}`, "DELETE")
  }

  async starGist(gistId: string) {
    return this.request(`/gists/${gistId}/star`, "PUT")
  }

  async unstarGist(gistId: string) {
    return this.request(`/gists/${gistId}/star`, "DELETE")
  }

  async isGistStarred(gistId: string) {
    try {
      await this.request(`/gists/${gistId}/star`)
      return true
    } catch (_) {
      return false
    }
  }

  async forkGist(gistId: string) {
    return this.request(`/gists/${gistId}/forks`, "POST")
  }

  async listGistForks(gistId: string, perPage = 30, page = 1) {
    return this.request(`/gists/${gistId}/forks?per_page=${perPage}&page=${page}`)
  }

  async listGistCommits(gistId: string, perPage = 30, page = 1) {
    return this.request(`/gists/${gistId}/commits?per_page=${perPage}&page=${page}`)
  }

  async getGistRevision(gistId: string, sha: string) {
    return this.request(`/gists/${gistId}/${sha}`)
  }

  async listUserGists(username: string, perPage = 30, page = 1) {
    return this.request(`/users/${username}/gists?per_page=${perPage}&page=${page}`)
  }

  async listGistComments(gistId: string) {
    return this.request(`/gists/${gistId}/comments`)
  }

  async getGistComment(gistId: string, commentId: number) {
    return this.request(`/gists/${gistId}/comments/${commentId}`)
  }

  async createGistComment(gistId: string, body: string) {
    return this.request(`/gists/${gistId}/comments`, "POST", { body })
  }

  async updateGistComment(gistId: string, commentId: number, body: string) {
    return this.request(`/gists/${gistId}/comments/${commentId}`, "PATCH", { body })
  }

  async deleteGistComment(gistId: string, commentId: number) {
    return this.request(`/gists/${gistId}/comments/${commentId}`, "DELETE")
  }
}

export function createGitHubApi(token: string) {
  return new GitHubApi(token)
}