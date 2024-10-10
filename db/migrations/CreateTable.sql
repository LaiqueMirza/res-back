CREATE TABLE User (
    user_id serial PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('user', 'expert', 'admin')) DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    deleted_at TIMESTAMP
);
CREATE TABLE Resumes (
    Resumes_id serial PRIMARY KEY,
    user_id UUID REFERENCES user(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    resume_data JSONB,
    template_id UUID REFERENCES ResumeTemplates(id),
    ats_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ResumeTemplates (
    ResumeTemplates_id serial PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    template_html TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE JobDescriptions (
    JobDescriptions_id serial PRIMARY KEY,
    user_id UUID REFERENCES user(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    required_skills JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE ATSKeywords (
    ATSKeywords_id serial PRIMARY KEY,
    industry VARCHAR(255) NOT NULL,
    keywords JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE Feedback (
    Feedback_id serial PRIMARY KEY,
    resume_id UUID REFERENCES Resumes(id) ON DELETE CASCADE,
    expert_id UUID REFERENCES user(user_id),
    feedback TEXT,
    meeting_link VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
