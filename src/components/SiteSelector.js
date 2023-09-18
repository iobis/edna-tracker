const SiteSelector = function({sites, siteId, handleSiteChange}) {
    return <div>
        <label className="mb-2">Select World Heritage site</label>
        <select className="form-select" value={siteId} onChange={handleSiteChange}>
        <option value="">Select site</option>
        {
            Object.values(sites).sort((a, b) => (a.name > b.name) ? 1 : -1).map((site) => <option key={site.plutof_id} value={site.plutof_id}>{site.name}</option>)
        }
        </select>
    </div>
}

export default SiteSelector;
